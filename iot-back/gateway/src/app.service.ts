import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { EventsGateway } from './events/events.gateway';

type ThingType = 'thermostat' | 'lamp' | 'motion';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private prisma = new PrismaClient();

  constructor(private readonly events: EventsGateway) {}

  private emitState(type: ThingType, state: any) {
    this.events.emitState(type, state);
  }

  // ----- Enregistrement -----
  async register(thing: any) {
    const type = String(thing.type).toLowerCase() as ThingType;
    const existing = await this.prisma.thing.findFirst({
      where: { name: thing.name },
    });

    const saved = existing
      ? await this.prisma.thing.update({
          where: { id: existing.id },
          data: { url: thing.url, type, state: thing.state ?? existing.state },
        })
      : await this.prisma.thing.create({
          data: {
            name: thing.name,
            url: thing.url,
            type,
            state: thing.state ?? {},
          },
        });

    if (saved?.state) this.emitState(type, saved.state);
    return saved;
  }

  // ----- Lecture -----
  async getAll() {
    return this.prisma.thing.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async getAllByType(type: string) {
    return this.prisma.thing.findMany({
      where: { type: type.toLowerCase() },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(type: string) {
    const thing = await this.prisma.thing.findFirst({
      where: { type: { equals: type.toLowerCase() } },
      orderBy: [{ createdAt: 'desc' }],
    });
    if (!thing) throw new Error(`Aucun thing trouvé pour le type "${type}"`);
    return thing;
  }

  // ----- Mise à jour -----
  async updateState(id: number, newState: any) {
    const updated = await this.prisma.thing.update({
      where: { id },
      data: { state: newState },
    });
    this.emitState(updated.type as ThingType, updated.state);
    return updated;
  }

  // ----- Appel d’action vers un service -----
  async callAction(type: string, action: string, body: any = {}) {
    const thing = await this.getOne(type);
    const base = `${thing.url}/${thing.type}`;

    const { data } = await axios.post(`${base}/actions/${action}`, body, {
      timeout: 2000,
    });

    try {
      const next = await axios
        .get(`${base}/properties`, { timeout: 2000 })
        .then((r) => r.data);
      await this.updateState(thing.id, next);
    } catch {
      this.logger.warn(
        `Impossible de rafraîchir l'état de ${thing.type} après action`,
      );
    }

    return data;
  }

  // ----- Lecture de propriétés -----
  async getProperty(type: string, prop: string) {
    const thing = await this.getOne(type);
    const { data } = await axios.get(
      `${thing.url}/${thing.type}/properties/${prop}`,
      { timeout: 2000 },
    );
    return data;
  }

  async getAllPropertys(type: string) {
    const thing = await this.getOne(type);
    const { data } = await axios.get(`${thing.url}/${thing.type}/properties`, {
      timeout: 2000,
    });

    try {
      const changed =
        JSON.stringify(thing.state ?? {}) !== JSON.stringify(data ?? {});
      if (changed) await this.updateState(thing.id, data);
    } catch {}

    return data;
  }

  // ----- Notification temps réel -----
  async notifyClients(type: ThingType, state: any) {
    const latest = await this.prisma.thing.findFirst({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      await this.prisma.thing.update({
        where: { id: latest.id },
        data: { state },
      });
    }

    this.emitState(type, state);
    return { ok: true };
  }
}

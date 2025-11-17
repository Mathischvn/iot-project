import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { EventsGateway } from './events/events.gateway';

type ThingType = 'thermostat' | 'lamp' | 'motion';

interface AutomationState {
  lastMotionAt: number | null;
  motionOffTimer: NodeJS.Timeout | null;
  noMotionTimer: NodeJS.Timeout | null;
  manualOverrideUntil: number | null;
  comfortActive: boolean;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private prisma = new PrismaClient();

  constructor(private readonly events: EventsGateway) {}

  private automation: AutomationState = {
    lastMotionAt: null,
    motionOffTimer: null,
    noMotionTimer: null,
    manualOverrideUntil: null,
    comfortActive: false,
  };

  private emitState(type: ThingType, state: any) {
    this.events.emitState(type, state);
  }

  // ============================================================
  //  ENREGISTREMENT + LECTURE
  // ============================================================

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

  async updateState(id: number, newState: any) {
    const updated = await this.prisma.thing.update({
      where: { id },
      data: { state: newState },
    });
    this.emitState(updated.type as ThingType, updated.state);
    return updated;
  }

  // ============================================================
  //  ACTIONS
  // ============================================================

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
      this.logger.warn(`Impossible de rafraîchir ${thing.type}`);
    }

    return data;
  }

  async callActionFromUser(type: string, action: string, body: any = {}) {
    this.automation.manualOverrideUntil = Date.now() + 3 * 60 * 1000;
    this.logger.log('🔓 Manual override activé (3 minutes)');
    return this.callAction(type, action, body);
  }

  private isManualOverrideActive() {
    const now = Date.now();
    return (
      !!this.automation.manualOverrideUntil &&
      now < this.automation.manualOverrideUntil
    );
  }

  // ============================================================
  //  PROPRIÉTÉS
  // ============================================================

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

  // ============================================================
  //  NOTIFICATIONS + RÈGLES
  // ============================================================

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

    await this.runRules(type, state);
    return { ok: true };
  }

  // ============================================================
  //  RÈGLES AUTOMATISÉES
  // ============================================================

  private async runRules(type: ThingType, state: any) {
    // === Rule 1 : Motion detected → Lamp ON (1 min)
    if (type === 'motion') {
      if (state.detected) {
        this.logger.log('💡 Motion détectée → Lamp ON 1 min');
        await this.safeCall(() =>
          this.callAction('lamp', 'setPower', { power: true }),
        );

        if (this.automation.motionOffTimer)
          clearTimeout(this.automation.motionOffTimer);

        this.automation.motionOffTimer = setTimeout(() => {
          if (!this.isManualOverrideActive()) {
            this.callAction('lamp', 'setPower', { power: false }).catch(
              () => {},
            );
          }
        }, 60_000);
        this.logger.log(' Lamp eteinte avec succès après 1 minute.');

        this.automation.lastMotionAt = Date.now();
        this.startNoMotionTimer();
      } else {
        this.startNoMotionTimer();
      }
    }

    // === Rule 2 : Comfort Mode
    if (type === 'thermostat') {
      const motion = await this.peekState('motion');
      const temp = this.readTemp(state);

      if ((motion as any)?.detected && temp !== null && temp < 19) {
        if (!this.automation.comfortActive) {
          this.logger.log('🔥 Comfort mode → chauffage + lampe ON');
          await this.safeCall(() =>
            this.callAction('thermostat', 'setMode', { mode: 'heating' }),
          );
          await this.safeCall(() =>
            this.callAction('thermostat', 'setTarget', { target: 19 }),
          );
          await this.safeCall(() =>
            this.callAction('lamp', 'setPower', { power: true }),
          );
          this.automation.comfortActive = true;
          this.logger.log('✅ Mode confort activé (chauffage ON, lampe ON).');
        }
      }

      if (temp !== null && temp >= 19 && this.automation.comfortActive) {
        this.logger.log('🌡️ Temp atteinte, fin Comfort mode');
        this.automation.comfortActive = false;
      }
    
    }
  }

  private startNoMotionTimer() {
    if (this.automation.noMotionTimer)
      clearTimeout(this.automation.noMotionTimer);

    this.automation.noMotionTimer = setTimeout(async () => {
      if (this.isManualOverrideActive()) return;
      this.logger.log('♻️ 5 min sans mouvement → Energy Saving');
      await this.safeCall(() =>
        this.callAction('lamp', 'setPower', { power: false }),
      );
      await this.safeCall(() =>
        this.callAction('thermostat', 'setMode', { mode: 'eco' }),
      );
      await this.safeCall(() =>
        this.callAction('thermostat', 'setTarget', { target: 17 }),
      );
      this.automation.comfortActive = false;
    }, 5 * 60_000);
  }

  // ============================================================
  //  HELPERS
  // ============================================================

  private async peekState(type: ThingType) {
    try {
      const thing = await this.getOne(type);
      return thing?.state ?? null;
    } catch {
      return null;
    }
  }

  private readTemp(state: any): number | null {
    if (!state) return null;
    if (typeof state.temperature === 'number') return state.temperature;
    if (typeof state.temp === 'number') return state.temp;
    return null;
  }

  private async safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch (e) {
      this.logger.warn('safeCall error: ' + (e as Error)?.message);
      return null;
    }
  }
}

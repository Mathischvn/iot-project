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

  // ============================
  //   Enregistrement et lecture
  // ============================

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

  // ============================
  //   Appels d’action
  // ============================

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

  // Action depuis l'utilisateur (UI) = priorité manuelle 3 minutes
  async callActionFromUser(type: string, action: string, body: any = {}) {
    this.automation.manualOverrideUntil = Date.now() + 3 * 60 * 1000;
    this.logger.log('🔓 Manual override activé (3 minutes)');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.callAction(type, action, body);
  }

  private isManualOverrideActive() {
    const now = Date.now();
    return (
      !!this.automation.manualOverrideUntil &&
      now < this.automation.manualOverrideUntil
    );
  }

  // ============================
  //   Lecture des propriétés
  // ============================

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

  // ============================
  //   Notifications et règles
  // ============================

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

    if (this.isManualOverrideActive()) {
      this.logger.log('⏸️ Automation ignorée (manual override actif)');
      return { ok: true };
    }

    // Appliquer les règles automatiques
    await this.runRules(type, state);
    return { ok: true };
  }

  // ============================
  //   Règles d’automatisation
  // ============================

  private async runRules(type: ThingType, state: any) {
    // === Rule 1 : Motion detected → Lamp ON (1 min)
    if (type === 'motion') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (state.detected) {
        this.logger.log('💡 Motion détectée → Lamp ON 1 min');
        console.log(
          '[MOTION] 🔆 Mouvement détecté : allumage de la lampe pour 1 minute.',
        );

        await this.safeCall(() =>
          this.callAction('lamp', 'setPower', { power: true }),
        );

        // Lampe OFF après 1 minute
        if (this.automation.motionOffTimer) {
          clearTimeout(this.automation.motionOffTimer);
          console.log('[MOTION] ⏱️ Timer OFF précédent annulé.');
        }

        this.automation.motionOffTimer = setTimeout(() => {
          if (!this.isManualOverrideActive()) {
            console.log(
              '[MOTION] 📴 1 minute écoulée → extinction automatique de la lampe.',
            );
            this.callAction('lamp', 'setPower', { power: false }).catch(() => {
              console.warn(
                '[MOTION] ⚠️ Erreur lors de l’extinction automatique.',
              );
            });
          } else {
            console.log(
              '[MOTION] 🚫 Override manuel actif → extinction ignorée.',
            );
          }
        }, 60_000);

        this.automation.lastMotionAt = Date.now();

        // relancer timer no-motion (Rule 3)
        console.log(
          '[MOTION] 🔁 Redémarrage du timer "no-motion" (5 minutes).',
        );
        this.startNoMotionTimer();
      } else {
        console.log(
          '[MOTION] ❌ Aucune détection → vérification du timer no-motion.',
        );
        this.startNoMotionTimer();
      }
    }

    // === Rule 2 : Temp < 19°C + Motion = Comfort mode
    if (type === 'thermostat') {
      const motion = await this.peekState('motion');
      const temp = this.readTemp(state);

      console.log(
        `[THERMOSTAT] 🌡️ Température lue : ${temp}°C | Motion: ${(motion as any)?.detected}`,
      );

      if ((motion as any)?.detected && temp !== null && temp < 19) {
        this.logger.log('🔥 Comfort mode → chauffage + lampe ON');
        console.log(
          '[THERMOSTAT] 🔥 Temp < 19°C et mouvement détecté → activation du mode confort.',
        );
        await this.safeCall(() =>
            this.callAction('thermostat', 'setMode', { mode: 'on' }),
        );
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
        console.log(
          '[THERMOSTAT] ✅ Mode confort activé (chauffage ON, lampe ON).',
        );
      }

      if (temp !== null && temp >= 19 && this.automation.comfortActive) {
        this.logger.log('🌡️ Temp atteinte, fin Comfort mode');
        console.log(
          '[THERMOSTAT] 🌡️ Température atteinte → désactivation du mode confort.',
        );
        this.automation.comfortActive = false;
      }
    }
  }

  // === Rule 3 : Pas de motion 5 min → Energy saving
  private startNoMotionTimer() {
    // Si un ancien timer existe, on le supprime
    if (this.automation.noMotionTimer) {
      clearTimeout(this.automation.noMotionTimer);
      console.log('[NO-MOTION] 🔁 Ancien timer "no-motion" annulé.');
    }

    console.log(
      '[NO-MOTION] 🕒 Nouveau timer lancé : 5 minutes sans mouvement = mode économie d’énergie.',
    );

    this.automation.noMotionTimer = setTimeout(async () => {
      console.log(
        '[NO-MOTION] ⏰ 5 minutes écoulées sans mouvement, vérification du manual override...',
      );

      if (this.isManualOverrideActive()) {
        console.log(
          '[NO-MOTION] 🚫 Override manuel actif → mode éco ignoré pour le moment.',
        );
        return;
      }

      this.logger.log('♻️ 5 min sans mouvement → Energy Saving');
      console.log(
        '[NO-MOTION] ♻️ Aucune activité détectée → passage en mode économie d’énergie.',
      );

      await this.safeCall(async () => {
        console.log('[NO-MOTION] 💡 Extinction de la lampe...');
        await this.callAction('lamp', 'setPower', { power: false });
        console.log('[NO-MOTION] ✅ Lampe éteinte.');
      });

      await this.safeCall(async () => {
        console.log('[NO-MOTION] 🌡️ Thermostat → mode "eco"...');
        await this.callAction('thermostat', 'setMode', { mode: 'eco' });
        console.log('[NO-MOTION] ✅ Thermostat passé en mode éco.');
      });

      await this.safeCall(async () => {
        console.log('[NO-MOTION] 🎯 Réglage température cible à 17°C...');
        await this.callAction('thermostat', 'setTarget', { target: 17 });
        console.log('[NO-MOTION] ✅ Température cible fixée à 17°C.');
      });
    }, 5 * 60_000);
  }

  // Helpers
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

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import axios from 'axios';
import { MotionState } from './motion.dto';

@Injectable()
export class MotionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MotionService.name);

  private state: MotionState = {
    detected: false,
    updatedAt: new Date().toISOString(),
  };

  private readonly gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
  private readonly selfUrl = process.env.SELF_URL || 'http://localhost:3003';
  private readonly instanceName = process.env.INSTANCE_NAME || 'motion1';

  private simulationTimer: NodeJS.Timeout | null = null;
  private readonly simulationPeriod = Math.max(0, Number(process.env.SIMULATION_PERIOD_MS || '0'));

  async onModuleInit() {
    await this.registerToGateway();
    this.startSimulationIfEnabled();
    this.logger.log('Motion service started');
  }

  onModuleDestroy() {
    if (this.simulationTimer) clearInterval(this.simulationTimer);
  }

  private async registerToGateway() {
    try {
      await axios.post(
        `${this.gatewayUrl}/register`,
        {
          name: this.instanceName,
          type: 'motion',
          url: this.selfUrl,
          state: this.getState(),
        },
        { timeout: 1000 },
      );
      this.logger.log('✅ Motion registered to Gateway');
    } catch (e: any) {
      this.logger.warn(`❌ Registration failed: ${e?.message || e}`);
    }
  }

  private async notifyGateway() {
    try {
      await axios.post(
        `${this.gatewayUrl}/gateway/update`,
        {
          type: 'motion',
          state: this.getState(),
        },
        { timeout: 1000 },
      );
    } catch (e: any) {
      this.logger.warn(`❌ notifyGateway: ${e?.message || e}`);
    }
  }

  // --- State ---
  getState(): MotionState {
    return { ...this.state };
  }

  detect(): MotionState {
    this.state.detected = true;
    this.state.updatedAt = new Date().toISOString();
    this.state.lastDetectedAt = this.state.updatedAt;
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  clear(): MotionState {
    this.state.detected = false;
    this.state.updatedAt = new Date().toISOString();
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  toggle(): MotionState {
    return this.state.detected ? this.clear() : this.detect();
  }

  reset(): MotionState {
    this.state = {
      detected: false,
      updatedAt: new Date().toISOString(),
    };
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  private startSimulationIfEnabled() {
    if (!this.simulationPeriod) return;
    this.simulationTimer = setInterval(() => {
      const rnd = Math.random();
      if (rnd < 0.5) this.detect();
      else this.clear();
    }, this.simulationPeriod);
  }
}
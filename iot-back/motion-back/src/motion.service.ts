import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import axios from 'axios';
import {
  UpdateArmedDto,
  UpdateSensitivityDto,
  TriggerDto,
  MotionState,
} from './motion.dto';

@Injectable()
export class MotionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MotionService.name);
  private simulationInterval: NodeJS.Timeout | null = null;

  private readonly gatewayUrl =
    process.env.GATEWAY_URL || 'http://localhost:3000';
  private readonly selfUrl = process.env.SELF_URL || 'http://localhost:3003';
  private readonly instanceName = process.env.INSTANCE_NAME || 'motion1';

  private state: MotionState = {
    detected: false,
    armed: true,
    sensitivity: 50, // 0 à 100
    updatedAt: new Date().toISOString(),
  };

  // ==========================
  //   Cycle de vie
  // ==========================
  async onModuleInit() {
    await this.registerToGateway();
    this.startSimulation();
    this.logger.log('🚨 Motion service started');
  }

  onModuleDestroy() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }

  // ==========================
  //   Enregistrement / Notify
  // ==========================
  private async registerToGateway() {
    try {
      await axios.post(`${this.gatewayUrl}/register`, {
        name: this.instanceName,
        type: 'motion',
        url: this.selfUrl,
        state: this.getState(),
      });
      this.logger.log('✅ Motion sensor registered on Gateway');
    } catch (e: any) {
      this.logger.error(`❌ Gateway registration failed: ${e?.message}`);
    }
  }

  private async notifyGateway() {
    try {
      await axios.post(`${this.gatewayUrl}/gateway/update`, {
        type: 'motion',
        state: this.getState(),
      });
    } catch (e: any) {
      this.logger.warn(`⚠️ notifyGateway failed: ${e?.message}`);
    }
  }

  // ==========================
  //   Simulation interne
  // ==========================
  private startSimulation() {
    this.simulationInterval = setInterval(() => this.simulate(), 5000);
  }

  private simulate() {
    if (!this.state.armed) return;

    // probabilité de basculement selon la sensibilité
    const chance = this.state.sensitivity / 100;
    if (Math.random() < chance * 0.2) {
      this.state.detected = !this.state.detected;
      this.state.updatedAt = new Date().toISOString();
      this.logger.log(
        `🎯 Motion ${this.state.detected ? 'detected' : 'cleared'}`,
      );
      this.notifyGateway().catch(() => {});
    }
  }

  // ==========================
  //   Getters / Actions
  // ==========================
  getState(): MotionState {
    return { ...this.state };
  }

  getDescription() {
    return {
      '@context': 'https://www.w3.org/2022/wot/td/v1.1',
      id: 'urn:dev:motion-001',
      title: 'Virtual Motion Sensor',
      description: 'A simulated motion detector',
      properties: {
        detected: { type: 'boolean', readOnly: true },
        armed: { type: 'boolean' },
        sensitivity: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          unit: 'percent',
        },
      },
      actions: {
        setArmed: { input: { type: 'boolean' } },
        setSensitivity: { input: { type: 'number', minimum: 0, maximum: 100 } },
        trigger: { input: { type: 'boolean' } },
        reset: { description: 'Reset to defaults' },
      },
    };
  }

  setArmed(dto: UpdateArmedDto): MotionState {
    this.state.armed = !!dto.armed;
    if (!this.state.armed) this.state.detected = false;
    this.state.updatedAt = new Date().toISOString();
    this.logger.log(`🔒 Sensor ${this.state.armed ? 'armed' : 'disarmed'}`);
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  setSensitivity(dto: UpdateSensitivityDto): MotionState {
    const s = Math.max(0, Math.min(100, Math.round(dto.sensitivity)));
    this.state.sensitivity = s;
    this.state.updatedAt = new Date().toISOString();
    this.logger.log(`🎚 Sensitivity set to ${s}`);
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  trigger(dto: TriggerDto): MotionState {
    this.state.detected = !!dto.detected;
    this.state.updatedAt = new Date().toISOString();
    this.logger.log(`🚨 Triggered manually: ${this.state.detected}`);
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  reset(): MotionState {
    this.state = {
      detected: false,
      armed: true,
      sensitivity: 50,
      updatedAt: new Date().toISOString(),
    };
    this.logger.log('♻️ Motion sensor reset');
    this.notifyGateway().catch(() => {});
    return this.getState();
  }
}

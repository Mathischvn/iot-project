import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import {
  LampState,
  UpdateBrightnessDto,
  UpdateModeDto,
  UpdatePowerDto,
} from './lamp.dto';

@Injectable()
export class LampService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LampService.name);
  private state: LampState = {
    power: false,
    brightness: 50,
    mode: 'normal',
    updatedAt: new Date().toISOString(),
  };
  private simulationInterval: NodeJS.Timeout | null = null;

  private readonly gatewayUrl =
    process.env.GATEWAY_URL || 'http://localhost:3000';
  private readonly selfUrl = process.env.SELF_URL || 'http://localhost:3001';
  private readonly instanceName = process.env.INSTANCE_NAME || 'lamp1';

  async onModuleInit() {
    this.startSimulation();
    this.registerToGateway().catch(() => {});
    this.logger.log('Lamp service started');
  }

  onModuleDestroy() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }

  private async registerToGateway() {
    try {
      await axios.post(
        `${this.gatewayUrl}/register`,
        {
          name: this.instanceName,
          type: 'lamp',
          url: this.selfUrl,
          state: this.getState(),
        },
        { timeout: 1000 },
      );
      this.logger.log('✅ Lamp enregistrée sur le Gateway');
    } catch (e: any) {
      this.logger.warn(`❌ Enregistrement Gateway échoué: ${e?.message || e}`);
    }
  }

  private async notifyGateway() {
    try {
      await axios.post(
        `${this.gatewayUrl}/gateway/update`,
        {
          type: 'lamp',
          state: this.getState(),
        },
        { timeout: 1000 },
      );
    } catch (e: any) {
      this.logger.warn(`❌ notifyGateway: ${e?.message || e}`);
    }
  }

  private startSimulation() {
    this.simulationInterval = setInterval(() => {
      const before = JSON.stringify(this.state);
      this.simulate();
      const after = JSON.stringify(this.state);
      if (before !== after) this.notifyGateway().catch(() => {});
    }, 5000);
  }

  private simulate() {
    if (this.state.power) {
      if (this.state.mode === 'eco' && this.state.brightness > 60) {
        this.state.brightness = Math.max(60, this.state.brightness - 5);
      } else if (this.state.mode === 'comfort' && this.state.brightness > 80) {
        this.state.brightness = Math.max(80, this.state.brightness - 5);
      }
    }
    if (this.state.brightness < 0) this.state.brightness = 0;
    if (this.state.brightness > 100) this.state.brightness = 100;
  }

  getState(): LampState {
    return { ...this.state };
  }

  getDescription() {
    return {
      '@context': 'https://www.w3.org/2022/wot/td/v1.1',
      id: 'urn:dev:lamp-001',
      title: 'Smart Lamp',
      description: 'Virtual lamp device',
      properties: {
        power: { type: 'boolean' },
        brightness: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          unit: 'percent',
        },
        mode: { type: 'string', enum: ['normal', 'eco', 'comfort'] },
        updatedAt: { type: 'string' },
      },
      actions: {
        setPower: { input: { type: 'boolean' } },
        setBrightness: { input: { type: 'number', minimum: 0, maximum: 100 } },
        setMode: {
          input: { type: 'string', enum: ['normal', 'eco', 'comfort'] },
        },
        reset: { description: 'Reset to defaults' },
      },
    };
  }

  setPower(dto: UpdatePowerDto): LampState {
    this.state.power = !!dto.power;
    if (
      this.state.power &&
      this.state.mode === 'eco' &&
      this.state.brightness > 60
    )
      this.state.brightness = 60;
    if (
      this.state.power &&
      this.state.mode === 'comfort' &&
      this.state.brightness > 80
    )
      this.state.brightness = 80;
    this.state.updatedAt = new Date().toISOString();
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  setBrightness(dto: UpdateBrightnessDto): LampState {
    const value = Math.max(0, Math.min(100, Math.round(dto.brightness)));
    this.state.brightness = value;
    if (this.state.mode === 'eco' && this.state.brightness > 60)
      this.state.brightness = 60;
    if (this.state.mode === 'comfort' && this.state.brightness > 80)
      this.state.brightness = 80;
    if (this.state.brightness > 0) this.state.power = true;
    this.state.updatedAt = new Date().toISOString();
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  setMode(dto: UpdateModeDto): LampState {
    this.state.mode = dto.mode;
    if (this.state.power) {
      if (dto.mode === 'eco' && this.state.brightness > 60)
        this.state.brightness = 60;
      if (dto.mode === 'comfort' && this.state.brightness > 80)
        this.state.brightness = 80;
    }
    this.state.updatedAt = new Date().toISOString();
    this.notifyGateway().catch(() => {});
    return this.getState();
  }

  reset(): LampState {
    this.state = {
      power: false,
      brightness: 50,
      mode: 'normal',
      updatedAt: new Date().toISOString(),
    };
    this.notifyGateway().catch(() => {});
    return this.getState();
  }
}

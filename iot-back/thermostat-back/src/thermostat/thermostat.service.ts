import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import axios from 'axios';
import {
  ThermostatState,
  UpdateModeDto,
  UpdateTargetDto,
} from './thermostat.dto';

@Injectable()
export class ThermostatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ThermostatService.name);
  private state: ThermostatState;
  private simulationInterval: NodeJS.Timeout | null = null;

  private readonly gatewayUrl =
    process.env.GATEWAY_URL || 'http://localhost:3000';
  private readonly selfUrl = process.env.SELF_URL || 'http://localhost:3002';

  constructor() {
    this.state = {
      temperature: 15,
      targetTemperature: 17,
      mode: 'off',
      isHeating: false,
    };
  }

  async onModuleInit() {
    await this.registerToGateway();
    this.startSimulation();
    this.logger.log('✅ Thermostat service started');
  }

  onModuleDestroy() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }

  private async registerToGateway() {
    try {
      await axios.post(`${this.gatewayUrl}/register`, {
        name: 'thermostat1',
        type: 'thermostat',
        url: this.selfUrl,
        state: this.getState(),
      });
      this.logger.log('📡 Thermostat registered to Gateway');
    } catch (e: any) {
      this.logger.error(`❌ Registration failed: ${e.message}`);
    }
  }

  private async notifyGateway() {
    try {
      await axios.post(`${this.gatewayUrl}/gateway/update`, {
        type: 'thermostat',
        state: this.getState(),
      });
    } catch {
      this.logger.warn('⚠️ Gateway notification failed');
    }
  }

  /**
   * Simulation : variation douce toutes les 5 secondes
   */
  private startSimulation() {
    this.simulationInterval = setInterval(() => {
      this.simulateStep();
    }, 5000);
  }

  private simulateStep() {
    const { temperature, targetTemperature, mode } = this.state;

    // Mode chauffage
    if (mode === 'heating') {
      if (temperature < targetTemperature) {
        this.state.temperature = Math.min(temperature + 0.2, targetTemperature);
        this.state.isHeating = true;
      } else if (temperature > targetTemperature) {
        this.state.temperature = Math.max(temperature - 0.1, targetTemperature);
        this.state.isHeating = false;
      } else {
        this.state.isHeating = false;
      }
    }

    // Mode éco
    else if (mode === 'eco') {
      if (temperature > 17) {
        this.state.temperature = Math.max(temperature - 0.1, 17);
      } else if (temperature < 17) {
        this.state.temperature = Math.min(temperature + 0.05, 17);
      }
      this.state.isHeating = false;
    }

    // Mode éteint
    else if (mode === 'off') {
      if (temperature > 16) {
        this.state.temperature = Math.max(temperature - 0.15, 16);
      }
      this.state.isHeating = false;
    }

    // Arrondir pour plus de réalisme
    this.state.temperature = Math.round(this.state.temperature * 10) / 10;

    void this.notifyGateway();
  }

  // ===========================
  //     Getters & Actions
  // ===========================

  getState(): ThermostatState {
    return { ...this.state };
  }

  getDescription() {
    return {
      '@context': 'https://www.w3.org/2022/wot/td/v1.1',
      id: 'urn:dev:thermostat-001',
      title: 'Smart Thermostat',
      description: 'Virtual thermostat device',
      properties: {
        temperature: { type: 'number', readOnly: true, unit: 'celsius' },
        targetTemperature: { type: 'number', unit: 'celsius' },
        mode: { type: 'string', enum: ['off', 'eco', 'heating'] },
        isHeating: { type: 'boolean', readOnly: true },
      },
      actions: {
        setTargetTemperature: {
          input: { type: 'number', minimum: 10, maximum: 30 },
        },
        setMode: {
          input: { type: 'string', enum: ['off', 'eco', 'heating'] },
        },
        reset: {},
      },
    };
  }

  setTargetTemperature(dto: UpdateTargetDto): ThermostatState {
    if (dto.targetTemperature < 10 || dto.targetTemperature > 30) {
      throw new Error('Target temperature must be between 10 and 30°C');
    }

    this.logger.log(
      `🎯 Nouvelle cible : ${dto.targetTemperature}°C (ancienne : ${this.state.targetTemperature}°C)`,
    );

    this.state.targetTemperature = dto.targetTemperature;

    // Si on baisse la température -> on arrête le chauffage pour simuler le refroidissement
    if (dto.targetTemperature < this.state.temperature) {
      this.state.isHeating = false;
      this.logger.log('❄️ Refroidissement progressif enclenché');
    } else {
      this.state.isHeating = true;
    }

    void this.notifyGateway();
    return this.getState();
  }

  setMode(dto: UpdateModeDto): ThermostatState {
    this.state.mode = dto.mode;

    if (dto.mode === 'eco') {
      this.state.targetTemperature = 17;
    } else if (dto.mode === 'heating' && this.state.targetTemperature < 19) {
      this.state.targetTemperature = 19;
    } else if (dto.mode === 'off') {
      this.state.isHeating = false;
    }

    this.logger.log(`⚙️ Mode set to ${dto.mode}`);
    void this.notifyGateway();
    return this.getState();
  }

  reset(): ThermostatState {
    this.state = {
      temperature: 20,
      targetTemperature: 19,
      mode: 'off',
      isHeating: false,
    };
    this.logger.log('♻️ Thermostat reset');
    void this.notifyGateway();
    return this.getState();
  }
}

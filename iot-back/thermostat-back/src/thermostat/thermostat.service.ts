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
  private simulationInterval: NodeJS.Timeout;

  private readonly gatewayUrl =
    process.env.GATEWAY_URL || 'http://localhost:3000';
  private readonly selfUrl = process.env.SELF_URL || 'http://localhost:3002';

  constructor() {
    this.state = {
      temperature: 15,
      targetTemperature: 19,
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
    } catch (e) {
      this.logger.warn('⚠️ Gateway notification failed');
    }
  }

  /**
   * Simulation : variation naturelle de la température toutes les 10 secondes
   */
  private startSimulation() {
    this.simulationInterval = setInterval(() => this.simulate(), 10000);
  }

  private simulate() {
    // ✅ S'assurer que le thermostat démarre en mode "heating" au début
    if (this.state.mode === 'off') {
      this.state.mode = 'heating';
      this.state.isHeating = true;
      this.logger.log('🔥 Thermostat initialisé en mode heating');
    }

    const { temperature, targetTemperature, mode } = this.state;

    // Variation naturelle aléatoire (entre -0.3 et +0.3°C)
    const randomFluctuation = (Math.random() - 0.5) * 0.6;

    if (mode === 'heating' && temperature < targetTemperature) {
      this.state.temperature = Math.min(temperature + 0.3, targetTemperature);
      this.state.isHeating = true;
    } else if (mode === 'heating' && temperature >= targetTemperature) {
      this.state.isHeating = false;
    } else {
      // @ts-expect-error
      if (mode === 'off') {
        // Refroidissement naturel + fluctuation
        this.state.temperature = Math.max(
          temperature - 0.1 + randomFluctuation,
          16,
        );
        this.state.isHeating = false;
      } else if (mode === 'eco') {
        // Refroidissement lent + fluctuation
        this.state.temperature = Math.max(
          temperature - 0.05 + randomFluctuation,
          15,
        );
        this.state.isHeating = false;
      } else {
        // Autres modes futurs
        this.state.temperature += randomFluctuation;
      }
    }

    // Variation ponctuelle importante (simulation d’ouverture de fenêtre par ex.)
    if (Math.random() < 0.05) {
      const suddenChange = (Math.random() - 0.5) * 2; // entre -1°C et +1°C
      this.state.temperature += suddenChange;
      this.logger.debug(`🌬 Variation soudaine: ${suddenChange.toFixed(1)}°C`);
    }

    // Arrondir à 0.1°C
    this.state.temperature = Math.round(this.state.temperature * 10) / 10;

    void this.notifyGateway();
  }

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
    this.state.targetTemperature = dto.targetTemperature;
    this.logger.log(`🎯 Target temperature set to ${dto.targetTemperature}°C`);
    void this.notifyGateway();
    return this.getState();
  }

  setMode(dto: UpdateModeDto): ThermostatState {
    this.state.mode = dto.mode;

    if (dto.mode === 'eco') {
      this.state.targetTemperature = 17;
    } else if (dto.mode === 'heating' && this.state.targetTemperature < 19) {
      this.state.targetTemperature = 19;
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

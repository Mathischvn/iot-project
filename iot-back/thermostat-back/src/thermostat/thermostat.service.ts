import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  ThermostatState,
  UpdateTargetDto,
  UpdateModeDto,
} from './thermostat.dto';

@Injectable()
export class ThermostatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ThermostatService.name);
  private state: ThermostatState;
  private simulationInterval: NodeJS.Timeout;

  constructor() {
    this.state = {
      temperature: 20.0,
      targetTemperature: 19.0,
      mode: 'off',
      isHeating: false,
    };
  }

  onModuleInit() {
    this.startSimulation();
    this.logger.log('Thermostat service started');
  }

  onModuleDestroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  private startSimulation() {
    this.simulationInterval = setInterval(() => {
      this.simulate();
    }, 5000);
  }

  private simulate() {
    const { temperature, targetTemperature, mode } = this.state;

    if (mode === 'heating' && temperature < targetTemperature) {
      this.state.temperature = Math.min(temperature + 0.5, targetTemperature);
      this.state.isHeating = true;
    } else if (mode === 'heating' && temperature >= targetTemperature) {
      this.state.isHeating = false;
    } else if (mode === 'off') {
      if (temperature > 18.0) {
        this.state.temperature = Math.max(temperature - 0.15, 18.0);
      }
      this.state.isHeating = false;
    } else if (mode === 'eco') {
      if (temperature > 17.0) {
        this.state.temperature = Math.max(temperature - 0.15, 17.0);
      }
      this.state.isHeating = false;
    }

    this.state.temperature = Math.round(this.state.temperature * 10) / 10;
  }

  getState(): ThermostatState {
    return { ...this.state };
  }

  getDescription() {
    return {
      '@context': 'https://www.w3.org/2022/wot/td/v1.1',
      id: 'urn:dev:thermostat-001',
      title: 'Smart Thermostat',
      description: 'Virtual thermostat',
      properties: {
        temperature: { type: 'number', readOnly: true, unit: 'celsius' },
        targetTemperature: {
          type: 'number',
          minimum: 15,
          maximum: 30,
          unit: 'celsius',
        },
        mode: { type: 'string', enum: ['off', 'heating', 'eco'] },
        isHeating: { type: 'boolean', readOnly: true },
      },
      actions: {
        setTargetTemperature: {
          input: { type: 'number', minimum: 15, maximum: 30 },
        },
        setMode: { input: { type: 'string', enum: ['off', 'heating', 'eco'] } },
        reset: { description: 'Reset to defaults' },
      },
    };
  }

  setTargetTemperature(dto: UpdateTargetDto): ThermostatState {
    if (dto.targetTemperature < 15 || dto.targetTemperature > 30) {
      throw new Error('Target temperature must be between 15 and 30°C');
    }
    this.state.targetTemperature = dto.targetTemperature;
    this.logger.log(`Target temperature set to ${dto.targetTemperature}°C`);
    return this.getState();
  }

  setMode(dto: UpdateModeDto): ThermostatState {
    this.state.mode = dto.mode;

    if (dto.mode === 'eco') {
      this.state.targetTemperature = 17.0;
    } else if (dto.mode === 'heating' && this.state.targetTemperature < 19.0) {
      this.state.targetTemperature = 19.0;
    }

    this.logger.log(`Mode set to ${dto.mode}`);
    return this.getState();
  }

  reset(): ThermostatState {
    this.state = {
      temperature: 20.0,
      targetTemperature: 19.0,
      mode: 'off',
      isHeating: false,
    };
    this.logger.log('Thermostat reset');
    return this.getState();
  }
}

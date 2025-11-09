import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import axios from 'axios';
import {
  ThermostatState,
  UpdateTargetDto,
  UpdateModeDto,
} from './thermostat.dto';

@Injectable()
export class ThermostatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ThermostatService.name);
  private simulationInterval: NodeJS.Timeout;

  // Configuration
  private readonly config = {
    gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:3000',
    selfUrl: process.env.SELF_URL || 'http://localhost:3002',
    instanceName: process.env.INSTANCE_NAME || 'thermostat1',
    simulationIntervalMs: 5000,
    requestTimeoutMs: 1000,
  };

  // Constantes de simulation
  private readonly SIMULATION = {
    heatingRate: 0.5,
    coolingRate: 0.15,
    minTemperature: 15,
    maxTemperature: 30,
    offModeFloor: 18.0,
    ecoModeFloor: 17.0,
    defaultTargetTemp: 19.0,
  };

  // État du thermostat
  private state: ThermostatState = {
    temperature: 20.0,
    targetTemperature: 19.0,
    mode: 'off',
    isHeating: false,
  };

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  async onModuleInit() {
    this.startSimulation();
    await this.registerToGateway();
    this.logger.log('Thermostat service started');
  }

  onModuleDestroy() {
    this.stopSimulation();
  }

  // ============================================
  // COMMUNICATION AVEC LE GATEWAY
  // ============================================

  private async registerToGateway() {
    try {
      await axios.post(
        `${this.config.gatewayUrl}/register`,
        {
          name: this.config.instanceName,
          type: 'thermostat',
          url: this.config.selfUrl,
          state: this.getState(),
        },
        { timeout: this.config.requestTimeoutMs },
      );
      this.logger.log('✅ Thermostat enregistré sur le Gateway');
    } catch (error) {
      this.logger.error(
        `❌ Enregistrement Gateway échoué: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private async notifyGateway() {
    try {
      await axios.post(
        `${this.config.gatewayUrl}/gateway/update`,
        {
          type: 'thermostat',
          state: this.getState(),
        },
        { timeout: this.config.requestTimeoutMs },
      );
    } catch (error) {
      this.logger.warn(
        `❌ Notification Gateway échouée: ${this.getErrorMessage(error)}`,
      );
    }
  }

  // ============================================
  // SIMULATION
  // ============================================

  private startSimulation() {
    this.simulationInterval = setInterval(() => {
      this.runSimulationCycle();
    }, this.config.simulationIntervalMs);
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  private runSimulationCycle() {
    const stateBefore = JSON.stringify(this.state);

    this.updateTemperature();

    const stateAfter = JSON.stringify(this.state);

    if (stateBefore !== stateAfter) {
      this.notifyGateway();
    }
  }

  private updateTemperature() {
    const { temperature, targetTemperature, mode } = this.state;

    switch (mode) {
      case 'heating':
        this.handleHeatingMode(temperature, targetTemperature);
        break;
      case 'off':
        this.handleOffMode(temperature);
        break;
      case 'eco':
        this.handleEcoMode(temperature, targetTemperature);
        break;
    }

    this.state.temperature = this.roundTemperature(this.state.temperature);
  }

  private handleHeatingMode(current: number, target: number) {
    if (current < target) {
      // Chauffage : augmenter vers la cible
      this.state.temperature = Math.min(
        current + this.SIMULATION.heatingRate,
        target,
      );
      this.state.isHeating = true;
    } else if (current > target) {
      // Refroidissement : baisser vers la cible
      this.state.temperature = Math.max(
        current - this.SIMULATION.coolingRate,
        target,
      );
      this.state.isHeating = false;
    } else {
      // Température atteinte
      this.state.isHeating = false;
    }
  }

  private handleOffMode(current: number) {
    if (current > this.SIMULATION.offModeFloor) {
      this.state.temperature = Math.max(
        current - this.SIMULATION.coolingRate,
        this.SIMULATION.offModeFloor,
      );
    }
    this.state.isHeating = false;
  }

  private handleEcoMode(current: number, target: number) {
    // Mode Eco : chauffe uniquement si en dessous de la cible
    // mais avec un refroidissement naturel vers le plancher eco (17°C)
    if (current < target) {
      // Chauffage minimal pour atteindre la cible
      this.state.temperature = Math.min(
        current + this.SIMULATION.heatingRate,
        target,
      );
      this.state.isHeating = true;
    } else {
      // Refroidissement naturel vers le plancher Eco
      if (current > this.SIMULATION.ecoModeFloor) {
        this.state.temperature = Math.max(
          current - this.SIMULATION.coolingRate,
          this.SIMULATION.ecoModeFloor,
        );
      }
      this.state.isHeating = false;
    }
  }

  // ============================================
  // API PUBLIQUE
  // ============================================

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
        temperature: {
          type: 'number',
          readOnly: true,
          unit: 'celsius',
        },
        targetTemperature: {
          type: 'number',
          minimum: this.SIMULATION.minTemperature,
          maximum: this.SIMULATION.maxTemperature,
          unit: 'celsius',
        },
        mode: {
          type: 'string',
          enum: ['off', 'heating', 'eco'],
        },
        isHeating: {
          type: 'boolean',
          readOnly: true,
        },
      },
      actions: {
        setTargetTemperature: {
          input: {
            type: 'number',
            minimum: this.SIMULATION.minTemperature,
            maximum: this.SIMULATION.maxTemperature,
          },
        },
        setMode: {
          input: {
            type: 'string',
            enum: ['off', 'heating', 'eco'],
          },
        },
        reset: {
          description: 'Reset to defaults',
        },
      },
    };
  }

  setTargetTemperature(dto: UpdateTargetDto): ThermostatState {
    this.validateTemperature(dto.targetTemperature);

    this.state.targetTemperature = dto.targetTemperature;
    this.logger.log(`Température cible: ${dto.targetTemperature}°C`);

    this.notifyGateway();
    return this.getState();
  }

  setMode(dto: UpdateModeDto): ThermostatState {
    this.state.mode = dto.mode;
    this.adjustTargetForMode(dto.mode);

    this.logger.log(`Mode: ${dto.mode}`);

    this.notifyGateway();
    return this.getState();
  }

  reset(): ThermostatState {
    this.state = {
      temperature: 20.0,
      targetTemperature: this.SIMULATION.defaultTargetTemp,
      mode: 'off',
      isHeating: false,
    };

    this.logger.log('Thermostat réinitialisé');

    this.notifyGateway();
    return this.getState();
  }

  // ============================================
  // HELPERS
  // ============================================

  private validateTemperature(temp: number) {
    if (
      temp < this.SIMULATION.minTemperature ||
      temp > this.SIMULATION.maxTemperature
    ) {
      throw new Error(
        `La température doit être entre ${this.SIMULATION.minTemperature} et ${this.SIMULATION.maxTemperature}°C`,
      );
    }
  }

  private adjustTargetForMode(mode: string) {
    if (mode === 'eco') {
      // Mode Eco : garde la température cible actuelle
      // L'utilisateur peut la modifier manuellement s'il le souhaite
    } else if (
      mode === 'heating' &&
      this.state.targetTemperature < this.SIMULATION.defaultTargetTemp
    ) {
      this.state.targetTemperature = this.SIMULATION.defaultTargetTemp;
    }
  }

  private roundTemperature(temp: number): number {
    return Math.round(temp * 10) / 10;
  }

  private getErrorMessage(error: any): string {
    return error?.message || String(error);
  }
}

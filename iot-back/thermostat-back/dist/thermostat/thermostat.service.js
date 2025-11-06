"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ThermostatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermostatService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ThermostatService = ThermostatService_1 = class ThermostatService {
    logger = new common_1.Logger(ThermostatService_1.name);
    state;
    simulationInterval;
    gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
    myUrl = process.env.SELF_URL || 'http://localhost:3002';
    constructor() {
        this.state = {
            temperature: 20.0,
            targetTemperature: 19.0,
            mode: 'off',
            isHeating: false,
        };
    }
    async onModuleInit() {
        this.startSimulation();
        await this.registerToGateway();
        this.logger.log('Thermostat service started');
    }
    onModuleDestroy() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
    }
    async registerToGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/register`, {
                name: 'thermostat1',
                type: 'thermostat',
                url: this.myUrl,
                state: this.getState(),
            });
            this.logger.log('✅ Thermostat enregistré sur le Gateway');
        }
        catch (e) {
            this.logger.error(`❌ Enregistrement Gateway échoué: ${e?.message || e}`);
        }
    }
    startSimulation() {
        this.simulationInterval = setInterval(() => {
            this.simulate();
        }, 5000);
    }
    simulate() {
        const { temperature, targetTemperature, mode } = this.state;
        if (mode === 'heating' && temperature < targetTemperature) {
            this.state.temperature = Math.min(temperature + 0.5, targetTemperature);
            this.state.isHeating = true;
        }
        else if (mode === 'heating' && temperature >= targetTemperature) {
            this.state.isHeating = false;
        }
        else if (mode === 'off') {
            if (temperature > 18.0) {
                this.state.temperature = Math.max(temperature - 0.15, 18.0);
            }
            this.state.isHeating = false;
        }
        else if (mode === 'eco') {
            if (temperature > 17.0) {
                this.state.temperature = Math.max(temperature - 0.15, 17.0);
            }
            this.state.isHeating = false;
        }
        this.state.temperature = Math.round(this.state.temperature * 10) / 10;
    }
    getState() {
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
    setTargetTemperature(dto) {
        if (dto.targetTemperature < 15 || dto.targetTemperature > 30) {
            throw new Error('Target temperature must be between 15 and 30°C');
        }
        this.state.targetTemperature = dto.targetTemperature;
        this.logger.log(`Target temperature set to ${dto.targetTemperature}°C`);
        return this.getState();
    }
    setMode(dto) {
        this.state.mode = dto.mode;
        if (dto.mode === 'eco') {
            this.state.targetTemperature = 17.0;
        }
        else if (dto.mode === 'heating' && this.state.targetTemperature < 19.0) {
            this.state.targetTemperature = 19.0;
        }
        this.logger.log(`Mode set to ${dto.mode}`);
        return this.getState();
    }
    reset() {
        this.state = {
            temperature: 20.0,
            targetTemperature: 19.0,
            mode: 'off',
            isHeating: false,
        };
        this.logger.log('Thermostat reset');
        return this.getState();
    }
};
exports.ThermostatService = ThermostatService;
exports.ThermostatService = ThermostatService = ThermostatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ThermostatService);
//# sourceMappingURL=thermostat.service.js.map
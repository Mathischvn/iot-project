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
    simulationInterval = null;
    gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
    selfUrl = process.env.SELF_URL || 'http://localhost:3002';
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
        if (this.simulationInterval)
            clearInterval(this.simulationInterval);
    }
    async registerToGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/register`, {
                name: 'thermostat1',
                type: 'thermostat',
                url: this.selfUrl,
                state: this.getState(),
            });
            this.logger.log('📡 Thermostat registered to Gateway');
        }
        catch (e) {
            this.logger.error(`❌ Registration failed: ${e.message}`);
        }
    }
    async notifyGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/gateway/update`, {
                type: 'thermostat',
                state: this.getState(),
            });
        }
        catch {
            this.logger.warn('⚠️ Gateway notification failed');
        }
    }
    startSimulation() {
        this.simulationInterval = setInterval(() => {
            this.simulateStep();
        }, 5000);
    }
    simulateStep() {
        const { temperature, targetTemperature, mode } = this.state;
        if (mode === 'heating') {
            if (temperature < targetTemperature) {
                this.state.temperature = Math.min(temperature + 0.2, targetTemperature);
                this.state.isHeating = true;
            }
            else if (temperature > targetTemperature) {
                this.state.temperature = Math.max(temperature - 0.1, targetTemperature);
                this.state.isHeating = false;
            }
            else {
                this.state.isHeating = false;
            }
        }
        else if (mode === 'eco') {
            if (temperature > 17) {
                this.state.temperature = Math.max(temperature - 0.1, 17);
            }
            else if (temperature < 17) {
                this.state.temperature = Math.min(temperature + 0.05, 17);
            }
            this.state.isHeating = false;
        }
        else if (mode === 'off') {
            if (temperature > 16) {
                this.state.temperature = Math.max(temperature - 0.15, 16);
            }
            this.state.isHeating = false;
        }
        this.state.temperature = Math.round(this.state.temperature * 10) / 10;
        void this.notifyGateway();
    }
    getState() {
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
    setTargetTemperature(dto) {
        if (dto.targetTemperature < 10 || dto.targetTemperature > 30) {
            throw new Error('Target temperature must be between 10 and 30°C');
        }
        this.logger.log(`🎯 Nouvelle cible : ${dto.targetTemperature}°C (ancienne : ${this.state.targetTemperature}°C)`);
        this.state.targetTemperature = dto.targetTemperature;
        if (dto.targetTemperature < this.state.temperature) {
            this.state.isHeating = false;
            this.logger.log('❄️ Refroidissement progressif enclenché');
        }
        else {
            this.state.isHeating = true;
        }
        void this.notifyGateway();
        return this.getState();
    }
    setMode(dto) {
        this.state.mode = dto.mode;
        if (dto.mode === 'eco') {
            this.state.targetTemperature = 17;
        }
        else if (dto.mode === 'heating' && this.state.targetTemperature < 19) {
            this.state.targetTemperature = 19;
        }
        else if (dto.mode === 'off') {
            this.state.isHeating = false;
        }
        this.logger.log(`⚙️ Mode set to ${dto.mode}`);
        void this.notifyGateway();
        return this.getState();
    }
    reset() {
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
};
exports.ThermostatService = ThermostatService;
exports.ThermostatService = ThermostatService = ThermostatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ThermostatService);
//# sourceMappingURL=thermostat.service.js.map
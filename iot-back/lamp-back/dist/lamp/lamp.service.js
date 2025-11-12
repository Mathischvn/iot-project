"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LampService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LampService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let LampService = LampService_1 = class LampService {
    logger = new common_1.Logger(LampService_1.name);
    state = {
        power: false,
        brightness: 50,
        mode: 'normal',
        updatedAt: new Date().toISOString(),
    };
    simulationInterval = null;
    brightnessTransitionInterval = null;
    gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
    selfUrl = process.env.SELF_URL || 'http://localhost:3001';
    instanceName = process.env.INSTANCE_NAME || 'lamp1';
    async onModuleInit() {
        this.startSimulation();
        this.registerToGateway().catch(() => { });
        this.logger.log('Lamp service started');
    }
    onModuleDestroy() {
        if (this.simulationInterval)
            clearInterval(this.simulationInterval);
        if (this.brightnessTransitionInterval)
            clearInterval(this.brightnessTransitionInterval);
    }
    async registerToGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/register`, {
                name: this.instanceName,
                type: 'lamp',
                url: this.selfUrl,
                state: this.getState(),
            }, { timeout: 1000 });
            this.logger.log('✅ Lamp enregistrée sur le Gateway');
        }
        catch (e) {
            this.logger.warn(`❌ Enregistrement Gateway échoué: ${e?.message || e}`);
        }
    }
    async notifyGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/gateway/update`, {
                type: 'lamp',
                state: this.getState(),
            }, { timeout: 1000 });
        }
        catch (e) {
            this.logger.warn(`❌ notifyGateway: ${e?.message || e}`);
        }
    }
    startSimulation() {
        this.simulationInterval = setInterval(() => {
            const before = JSON.stringify(this.state);
            this.simulate();
            const after = JSON.stringify(this.state);
            if (before !== after)
                this.notifyGateway().catch(() => { });
        }, 5000);
    }
    simulate() {
        if (this.brightnessTransitionInterval)
            return;
        if (this.state.power) {
            if (this.state.mode === 'eco' && this.state.brightness > 60) {
                this.state.brightness = Math.max(60, this.state.brightness - 5);
            }
            else if (this.state.mode === 'comfort' && this.state.brightness > 80) {
                this.state.brightness = Math.max(80, this.state.brightness - 5);
            }
        }
        if (this.state.brightness < 0)
            this.state.brightness = 0;
        if (this.state.brightness > 100)
            this.state.brightness = 100;
    }
    getState() {
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
    transitionBrightness(target, duration = 2500, steps = 25) {
        target = Math.max(0, Math.min(100, Math.round(target)));
        if (this.brightnessTransitionInterval) {
            clearInterval(this.brightnessTransitionInterval);
            this.brightnessTransitionInterval = null;
        }
        const start = this.state.brightness;
        if (start === target)
            return;
        const intervalMs = Math.max(10, Math.floor(duration / steps));
        let stepIndex = 0;
        this.brightnessTransitionInterval = setInterval(() => {
            stepIndex++;
            const t = Math.min(1, stepIndex / steps);
            const next = Math.round(start + (target - start) * t);
            this.state.brightness = next;
            this.state.updatedAt = new Date().toISOString();
            this.notifyGateway().catch(() => { });
            if (t >= 1) {
                if (this.brightnessTransitionInterval) {
                    clearInterval(this.brightnessTransitionInterval);
                    this.brightnessTransitionInterval = null;
                }
            }
        }, intervalMs);
    }
    setPower(dto) {
        this.state.power = !!dto.power;
        if (this.state.power) {
            const limit = this.state.mode === 'eco'
                ? 60
                : this.state.mode === 'comfort'
                    ? 80
                    : null;
            if (limit !== null && this.state.brightness > limit) {
                this.transitionBrightness(limit);
            }
        }
        this.state.updatedAt = new Date().toISOString();
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    setBrightness(dto) {
        const value = Math.max(0, Math.min(100, Math.round(dto.brightness)));
        if (this.brightnessTransitionInterval) {
            clearInterval(this.brightnessTransitionInterval);
            this.brightnessTransitionInterval = null;
        }
        this.state.brightness = value;
        if (this.state.mode === 'eco' && this.state.brightness > 60)
            this.state.brightness = 60;
        if (this.state.mode === 'comfort' && this.state.brightness > 80)
            this.state.brightness = 80;
        if (this.state.brightness > 0)
            this.state.power = true;
        this.state.updatedAt = new Date().toISOString();
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    setMode(dto) {
        this.state.mode = dto.mode;
        this.state.updatedAt = new Date().toISOString();
        this.notifyGateway().catch(() => { });
        if (this.state.power) {
            const limit = dto.mode === 'eco' ? 60 : dto.mode === 'comfort' ? 80 : null;
            if (limit !== null && this.state.brightness > limit) {
                this.transitionBrightness(limit, 2500, 25);
            }
        }
        return this.getState();
    }
    reset() {
        if (this.brightnessTransitionInterval) {
            clearInterval(this.brightnessTransitionInterval);
            this.brightnessTransitionInterval = null;
        }
        this.state = {
            power: false,
            brightness: 50,
            mode: 'normal',
            updatedAt: new Date().toISOString(),
        };
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
};
exports.LampService = LampService;
exports.LampService = LampService = LampService_1 = __decorate([
    (0, common_1.Injectable)()
], LampService);
//# sourceMappingURL=lamp.service.js.map
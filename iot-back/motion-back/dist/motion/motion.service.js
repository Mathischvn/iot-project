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
var MotionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let MotionService = MotionService_1 = class MotionService {
    logger = new common_1.Logger(MotionService_1.name);
    simulationInterval = null;
    gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
    selfUrl = process.env.SELF_URL || 'http://localhost:3003';
    instanceName = process.env.INSTANCE_NAME || 'motion1';
    state = {
        detected: false,
        armed: true,
        sensitivity: 50,
        updatedAt: new Date().toISOString(),
    };
    async onModuleInit() {
        await this.registerToGateway();
        this.startSimulation();
        this.logger.log('🚨 Motion service started');
    }
    onModuleDestroy() {
        if (this.simulationInterval)
            clearInterval(this.simulationInterval);
    }
    async registerToGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/register`, {
                name: this.instanceName,
                type: 'motion',
                url: this.selfUrl,
                state: this.getState(),
            });
            this.logger.log('✅ Motion sensor registered on Gateway');
        }
        catch (e) {
            this.logger.error(`❌ Gateway registration failed: ${e?.message}`);
        }
    }
    async notifyGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/gateway/update`, {
                type: 'motion',
                state: this.getState(),
            });
        }
        catch (e) {
            this.logger.warn(`⚠️ notifyGateway failed: ${e?.message}`);
        }
    }
    startSimulation() {
        this.simulationInterval = setInterval(() => this.simulate(), 5000);
    }
    simulate() {
        if (!this.state.armed)
            return;
        const chance = this.state.sensitivity / 100;
        if (Math.random() < chance * 0.2) {
            this.state.detected = !this.state.detected;
            this.state.updatedAt = new Date().toISOString();
            this.logger.log(`🎯 Motion ${this.state.detected ? 'detected' : 'cleared'}`);
            this.notifyGateway().catch(() => { });
        }
    }
    getState() {
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
    setArmed(dto) {
        this.state.armed = !!dto.armed;
        if (!this.state.armed)
            this.state.detected = false;
        this.state.updatedAt = new Date().toISOString();
        this.logger.log(`🔒 Sensor ${this.state.armed ? 'armed' : 'disarmed'}`);
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    setSensitivity(dto) {
        const s = Math.max(0, Math.min(100, Math.round(dto.sensitivity)));
        this.state.sensitivity = s;
        this.state.updatedAt = new Date().toISOString();
        this.logger.log(`🎚 Sensitivity set to ${s}`);
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    trigger(dto) {
        this.state.detected = !!dto.detected;
        this.state.updatedAt = new Date().toISOString();
        this.logger.log(`🚨 Triggered manually: ${this.state.detected}`);
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    reset() {
        this.state = {
            detected: false,
            armed: true,
            sensitivity: 50,
            updatedAt: new Date().toISOString(),
        };
        this.logger.log('♻️ Motion sensor reset');
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
};
exports.MotionService = MotionService;
exports.MotionService = MotionService = MotionService_1 = __decorate([
    (0, common_1.Injectable)()
], MotionService);
//# sourceMappingURL=motion.service.js.map
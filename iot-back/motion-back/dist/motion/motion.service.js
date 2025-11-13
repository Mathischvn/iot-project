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
    state = {
        detected: false,
        updatedAt: new Date().toISOString(),
    };
    gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';
    selfUrl = process.env.SELF_URL || 'http://localhost:3003';
    instanceName = process.env.INSTANCE_NAME || 'motion1';
    simulationTimer = null;
    simulationPeriod = Math.max(0, Number(process.env.SIMULATION_PERIOD_MS || '0'));
    async onModuleInit() {
        await this.registerToGateway();
        this.startSimulationIfEnabled();
        this.logger.log('Motion service started');
    }
    onModuleDestroy() {
        if (this.simulationTimer)
            clearInterval(this.simulationTimer);
    }
    async registerToGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/register`, {
                name: this.instanceName,
                type: 'motion',
                url: this.selfUrl,
                state: this.getState(),
            }, { timeout: 1000 });
            this.logger.log('✅ Motion registered to Gateway');
        }
        catch (e) {
            this.logger.warn(`❌ Registration failed: ${e?.message || e}`);
        }
    }
    async notifyGateway() {
        try {
            await axios_1.default.post(`${this.gatewayUrl}/gateway/update`, {
                type: 'motion',
                state: this.getState(),
            }, { timeout: 1000 });
        }
        catch (e) {
            this.logger.warn(`❌ notifyGateway: ${e?.message || e}`);
        }
    }
    getState() {
        return { ...this.state };
    }
    detect() {
        this.state.detected = true;
        this.state.updatedAt = new Date().toISOString();
        this.state.lastDetectedAt = this.state.updatedAt;
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    clear() {
        this.state.detected = false;
        this.state.updatedAt = new Date().toISOString();
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    toggle() {
        return this.state.detected ? this.clear() : this.detect();
    }
    reset() {
        this.state = {
            detected: false,
            updatedAt: new Date().toISOString(),
        };
        this.notifyGateway().catch(() => { });
        return this.getState();
    }
    startSimulationIfEnabled() {
        if (!this.simulationPeriod)
            return;
        this.simulationTimer = setInterval(() => {
            const rnd = Math.random();
            if (rnd < 0.5)
                this.detect();
            else
                this.clear();
        }, this.simulationPeriod);
    }
};
exports.MotionService = MotionService;
exports.MotionService = MotionService = MotionService_1 = __decorate([
    (0, common_1.Injectable)()
], MotionService);
//# sourceMappingURL=motion.service.js.map
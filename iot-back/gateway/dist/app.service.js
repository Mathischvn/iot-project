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
var GatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const events_gateway_1 = require("./events/events.gateway");
let GatewayService = GatewayService_1 = class GatewayService {
    events;
    logger = new common_1.Logger(GatewayService_1.name);
    prisma = new client_1.PrismaClient();
    constructor(events) {
        this.events = events;
    }
    automation = {
        lastMotionAt: null,
        motionOffTimer: null,
        noMotionTimer: null,
        manualOverrideUntil: null,
        comfortActive: false,
    };
    emitState(type, state) {
        this.events.emitState(type, state);
    }
    async register(thing) {
        const type = String(thing.type).toLowerCase();
        const existing = await this.prisma.thing.findFirst({
            where: { name: thing.name },
        });
        const saved = existing
            ? await this.prisma.thing.update({
                where: { id: existing.id },
                data: { url: thing.url, type, state: thing.state ?? existing.state },
            })
            : await this.prisma.thing.create({
                data: {
                    name: thing.name,
                    url: thing.url,
                    type,
                    state: thing.state ?? {},
                },
            });
        if (saved?.state)
            this.emitState(type, saved.state);
        return saved;
    }
    async getAll() {
        return this.prisma.thing.findMany({ orderBy: { createdAt: 'asc' } });
    }
    async getAllByType(type) {
        return this.prisma.thing.findMany({
            where: { type: type.toLowerCase() },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOne(type) {
        const thing = await this.prisma.thing.findFirst({
            where: { type: { equals: type.toLowerCase() } },
            orderBy: [{ createdAt: 'desc' }],
        });
        if (!thing)
            throw new Error(`Aucun thing trouvé pour le type "${type}"`);
        return thing;
    }
    async updateState(id, newState) {
        const updated = await this.prisma.thing.update({
            where: { id },
            data: { state: newState },
        });
        this.emitState(updated.type, updated.state);
        return updated;
    }
    async callAction(type, action, body = {}) {
        const thing = await this.getOne(type);
        const base = `${thing.url}/${thing.type}`;
        const { data } = await axios_1.default.post(`${base}/actions/${action}`, body, {
            timeout: 2000,
        });
        try {
            const next = await axios_1.default
                .get(`${base}/properties`, { timeout: 2000 })
                .then((r) => r.data);
            await this.updateState(thing.id, next);
        }
        catch {
            this.logger.warn(`Impossible de rafraîchir ${thing.type}`);
        }
        return data;
    }
    async callActionFromUser(type, action, body = {}) {
        this.automation.manualOverrideUntil = Date.now() + 3 * 60 * 1000;
        this.logger.log('🔓 Manual override activé (3 minutes)');
        return this.callAction(type, action, body);
    }
    isManualOverrideActive() {
        const now = Date.now();
        return (!!this.automation.manualOverrideUntil &&
            now < this.automation.manualOverrideUntil);
    }
    async getProperty(type, prop) {
        const thing = await this.getOne(type);
        const { data } = await axios_1.default.get(`${thing.url}/${thing.type}/properties/${prop}`, { timeout: 2000 });
        return data;
    }
    async getAllPropertys(type) {
        const thing = await this.getOne(type);
        const { data } = await axios_1.default.get(`${thing.url}/${thing.type}/properties`, {
            timeout: 2000,
        });
        try {
            const changed = JSON.stringify(thing.state ?? {}) !== JSON.stringify(data ?? {});
            if (changed)
                await this.updateState(thing.id, data);
        }
        catch { }
        return data;
    }
    async notifyClients(type, state) {
        const latest = await this.prisma.thing.findFirst({
            where: { type },
            orderBy: { createdAt: 'desc' },
        });
        if (latest) {
            await this.prisma.thing.update({
                where: { id: latest.id },
                data: { state },
            });
        }
        this.emitState(type, state);
        await this.runRules(type, state);
        return { ok: true };
    }
    async runRules(type, state) {
        if (type === 'motion') {
            if (state.detected) {
                this.logger.log('💡 Motion détectée → Lamp ON 1 min');
                await this.safeCall(() => this.callAction('lamp', 'setPower', { power: true }));
                if (this.automation.motionOffTimer)
                    clearTimeout(this.automation.motionOffTimer);
                this.automation.motionOffTimer = setTimeout(() => {
                    this.callAction('lamp', 'setPower', { power: false }).catch(() => { });
                }, 60_000);
                this.logger.log(' Lamp eteinte avec succès après 1 minute.');
                this.automation.lastMotionAt = Date.now();
                this.startNoMotionTimer();
            }
            else {
                this.startNoMotionTimer();
            }
        }
        if (type === 'thermostat') {
            const motion = await this.peekState('motion');
            const temp = this.readTemp(state);
            if (motion?.detected && temp !== null && temp < 19) {
                if (!this.automation.comfortActive) {
                    this.logger.log('🔥 Comfort mode → chauffage + lampe ON');
                    await this.safeCall(() => this.callAction('thermostat', 'setMode', { mode: 'heating' }));
                    await this.safeCall(() => this.callAction('thermostat', 'setTarget', { target: 19 }));
                    await this.safeCall(() => this.callAction('lamp', 'setPower', { power: true }));
                    this.automation.comfortActive = true;
                    this.logger.log('✅ Mode confort activé (chauffage ON, lampe ON).');
                }
            }
            if (temp !== null && temp >= 19 && this.automation.comfortActive) {
                this.logger.log('🌡️ Temp atteinte, fin Comfort mode');
                this.automation.comfortActive = false;
            }
        }
    }
    startNoMotionTimer() {
        if (this.automation.noMotionTimer)
            clearTimeout(this.automation.noMotionTimer);
        this.automation.noMotionTimer = setTimeout(async () => {
            if (this.isManualOverrideActive())
                return;
            this.logger.log('♻️ 5 min sans mouvement → Energy Saving');
            await this.safeCall(() => this.callAction('lamp', 'setPower', { power: false }));
            await this.safeCall(() => this.callAction('thermostat', 'setMode', { mode: 'eco' }));
            await this.safeCall(() => this.callAction('thermostat', 'setTarget', { target: 17 }));
            this.automation.comfortActive = false;
        }, 5 * 60_000);
    }
    async peekState(type) {
        try {
            const thing = await this.getOne(type);
            return thing?.state ?? null;
        }
        catch {
            return null;
        }
    }
    readTemp(state) {
        if (!state)
            return null;
        if (typeof state.temperature === 'number')
            return state.temperature;
        if (typeof state.temp === 'number')
            return state.temp;
        return null;
    }
    async safeCall(fn) {
        try {
            return await fn();
        }
        catch (e) {
            this.logger.warn('safeCall error: ' + e?.message);
            return null;
        }
    }
};
exports.GatewayService = GatewayService;
exports.GatewayService = GatewayService = GatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_gateway_1.EventsGateway])
], GatewayService);
//# sourceMappingURL=app.service.js.map
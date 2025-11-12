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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LampController = void 0;
const common_1 = require("@nestjs/common");
const lamp_service_1 = require("./lamp.service");
const lamp_dto_1 = require("./lamp.dto");
let LampController = class LampController {
    lampService;
    constructor(lampService) {
        this.lampService = lampService;
    }
    getInfo() {
        return { name: 'Smart Lamp', type: 'lamp', status: 'active' };
    }
    getDescription() {
        return this.lampService.getDescription();
    }
    getProperties() {
        return this.lampService.getState();
    }
    getPower() {
        const state = this.lampService.getState();
        return { value: state.power };
    }
    getBrightness() {
        const state = this.lampService.getState();
        return { value: state.brightness };
    }
    getMode() {
        const state = this.lampService.getState();
        return { value: state.mode };
    }
    setPower(dto) {
        return this.lampService.setPower(dto);
    }
    setBrightness(dto) {
        return this.lampService.setBrightness(dto);
    }
    setMode(dto) {
        return this.lampService.setMode(dto);
    }
    actionSetPower(dto) {
        return this.lampService.setPower(dto);
    }
    actionSetBrightness(dto) {
        return this.lampService.setBrightness(dto);
    }
    actionSetMode(dto) {
        return this.lampService.setMode(dto);
    }
    actionReset() {
        return this.lampService.reset();
    }
};
exports.LampController = LampController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LampController.prototype, "getInfo", null);
__decorate([
    (0, common_1.Get)('description'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LampController.prototype, "getDescription", null);
__decorate([
    (0, common_1.Get)('properties'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "getProperties", null);
__decorate([
    (0, common_1.Get)('properties/power'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LampController.prototype, "getPower", null);
__decorate([
    (0, common_1.Get)('properties/brightness'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LampController.prototype, "getBrightness", null);
__decorate([
    (0, common_1.Get)('properties/mode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LampController.prototype, "getMode", null);
__decorate([
    (0, common_1.Put)('properties/power'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lamp_dto_1.UpdatePowerDto]),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "setPower", null);
__decorate([
    (0, common_1.Put)('properties/brightness'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lamp_dto_1.UpdateBrightnessDto]),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "setBrightness", null);
__decorate([
    (0, common_1.Put)('properties/mode'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lamp_dto_1.UpdateModeDto]),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "setMode", null);
__decorate([
    (0, common_1.Post)('actions/setPower'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lamp_dto_1.UpdatePowerDto]),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "actionSetPower", null);
__decorate([
    (0, common_1.Post)('actions/setBrightness'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lamp_dto_1.UpdateBrightnessDto]),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "actionSetBrightness", null);
__decorate([
    (0, common_1.Post)('actions/setMode'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lamp_dto_1.UpdateModeDto]),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "actionSetMode", null);
__decorate([
    (0, common_1.Post)('actions/reset'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", lamp_dto_1.LampState)
], LampController.prototype, "actionReset", null);
exports.LampController = LampController = __decorate([
    (0, common_1.Controller)('lamp'),
    __metadata("design:paramtypes", [lamp_service_1.LampService])
], LampController);
//# sourceMappingURL=lamp.controller.js.map
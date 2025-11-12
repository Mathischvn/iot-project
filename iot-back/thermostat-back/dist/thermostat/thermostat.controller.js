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
exports.ThermostatController = void 0;
const common_1 = require("@nestjs/common");
const thermostat_service_1 = require("./thermostat.service");
const thermostat_dto_1 = require("./thermostat.dto");
let ThermostatController = class ThermostatController {
    thermostatService;
    constructor(thermostatService) {
        this.thermostatService = thermostatService;
    }
    getInfo() {
        return { name: 'Smart Thermostat', type: 'thermostat', status: 'active' };
    }
    getDescription() {
        return this.thermostatService.getDescription();
    }
    getProperties() {
        return this.thermostatService.getState();
    }
    getTemperature() {
        const state = this.thermostatService.getState();
        return { value: state.temperature, unit: 'celsius' };
    }
    getTargetTemperature() {
        const state = this.thermostatService.getState();
        return { value: state.targetTemperature, unit: 'celsius' };
    }
    getMode() {
        const state = this.thermostatService.getState();
        return { value: state.mode };
    }
    getIsHeating() {
        const state = this.thermostatService.getState();
        return { value: state.isHeating };
    }
    setTargetTemperature(dto) {
        return this.thermostatService.setTargetTemperature(dto);
    }
    setMode(dto) {
        return this.thermostatService.setMode(dto);
    }
    actionSetTargetTemperature(dto) {
        return this.thermostatService.setTargetTemperature(dto);
    }
    actionSetMode(dto) {
        return this.thermostatService.setMode(dto);
    }
    actionReset() {
        return this.thermostatService.reset();
    }
};
exports.ThermostatController = ThermostatController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThermostatController.prototype, "getInfo", null);
__decorate([
    (0, common_1.Get)('description'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThermostatController.prototype, "getDescription", null);
__decorate([
    (0, common_1.Get)('properties'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", thermostat_dto_1.ThermostatState)
], ThermostatController.prototype, "getProperties", null);
__decorate([
    (0, common_1.Get)('properties/temperature'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThermostatController.prototype, "getTemperature", null);
__decorate([
    (0, common_1.Get)('properties/targetTemperature'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThermostatController.prototype, "getTargetTemperature", null);
__decorate([
    (0, common_1.Get)('properties/mode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThermostatController.prototype, "getMode", null);
__decorate([
    (0, common_1.Get)('properties/isHeating'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThermostatController.prototype, "getIsHeating", null);
__decorate([
    (0, common_1.Put)('properties/targetTemperature'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [thermostat_dto_1.UpdateTargetDto]),
    __metadata("design:returntype", thermostat_dto_1.ThermostatState)
], ThermostatController.prototype, "setTargetTemperature", null);
__decorate([
    (0, common_1.Put)('properties/mode'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [thermostat_dto_1.UpdateModeDto]),
    __metadata("design:returntype", thermostat_dto_1.ThermostatState)
], ThermostatController.prototype, "setMode", null);
__decorate([
    (0, common_1.Post)('actions/setTargetTemperature'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [thermostat_dto_1.UpdateTargetDto]),
    __metadata("design:returntype", thermostat_dto_1.ThermostatState)
], ThermostatController.prototype, "actionSetTargetTemperature", null);
__decorate([
    (0, common_1.Post)('actions/setMode'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [thermostat_dto_1.UpdateModeDto]),
    __metadata("design:returntype", thermostat_dto_1.ThermostatState)
], ThermostatController.prototype, "actionSetMode", null);
__decorate([
    (0, common_1.Post)('actions/reset'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", thermostat_dto_1.ThermostatState)
], ThermostatController.prototype, "actionReset", null);
exports.ThermostatController = ThermostatController = __decorate([
    (0, common_1.Controller)('thermostat'),
    __metadata("design:paramtypes", [thermostat_service_1.ThermostatService])
], ThermostatController);
//# sourceMappingURL=thermostat.controller.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermostatModule = void 0;
const common_1 = require("@nestjs/common");
const thermostat_controller_1 = require("./thermostat.controller");
const thermostat_service_1 = require("./thermostat.service");
let ThermostatModule = class ThermostatModule {
};
exports.ThermostatModule = ThermostatModule;
exports.ThermostatModule = ThermostatModule = __decorate([
    (0, common_1.Module)({
        controllers: [thermostat_controller_1.ThermostatController],
        providers: [thermostat_service_1.ThermostatService],
        exports: [thermostat_service_1.ThermostatService],
    })
], ThermostatModule);
//# sourceMappingURL=thermostat.module.js.map
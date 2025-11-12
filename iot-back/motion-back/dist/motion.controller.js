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
exports.MotionController = void 0;
const common_1 = require("@nestjs/common");
const motion_service_1 = require("./motion.service");
const motion_dto_1 = require("./motion.dto");
let MotionController = class MotionController {
    motionService;
    constructor(motionService) {
        this.motionService = motionService;
    }
    getDescription() {
        return this.motionService.getDescription();
    }
    getAllProperties() {
        return this.motionService.getState();
    }
    getDetected() {
        return { detected: this.motionService.getState().detected };
    }
    getArmed() {
        return { armed: this.motionService.getState().armed };
    }
    getSensitivity() {
        return { sensitivity: this.motionService.getState().sensitivity };
    }
    setArmed(dto) {
        return this.motionService.setArmed(dto);
    }
    setSensitivity(dto) {
        return this.motionService.setSensitivity(dto);
    }
    trigger(dto) {
        return this.motionService.trigger(dto);
    }
    reset() {
        return this.motionService.reset();
    }
};
exports.MotionController = MotionController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "getDescription", null);
__decorate([
    (0, common_1.Get)('properties'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "getAllProperties", null);
__decorate([
    (0, common_1.Get)('properties/detected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "getDetected", null);
__decorate([
    (0, common_1.Get)('properties/armed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "getArmed", null);
__decorate([
    (0, common_1.Get)('properties/sensitivity'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "getSensitivity", null);
__decorate([
    (0, common_1.Post)('actions/setArmed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [motion_dto_1.UpdateArmedDto]),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "setArmed", null);
__decorate([
    (0, common_1.Post)('actions/setSensitivity'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [motion_dto_1.UpdateSensitivityDto]),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "setSensitivity", null);
__decorate([
    (0, common_1.Post)('actions/trigger'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [motion_dto_1.TriggerDto]),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "trigger", null);
__decorate([
    (0, common_1.Post)('actions/reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotionController.prototype, "reset", null);
exports.MotionController = MotionController = __decorate([
    (0, common_1.Controller)('motion'),
    __metadata("design:paramtypes", [motion_service_1.MotionService])
], MotionController);
//# sourceMappingURL=motion.controller.js.map
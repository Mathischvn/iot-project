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
    info() {
        return { name: 'Motion Sensor', type: 'motion', status: 'active' };
    }
    getProperties() {
        return this.motionService.getState();
    }
    detect() {
        return this.motionService.detect();
    }
    clear() {
        return this.motionService.clear();
    }
    toggle() {
        return this.motionService.toggle();
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
], MotionController.prototype, "info", null);
__decorate([
    (0, common_1.Get)('properties'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", motion_dto_1.MotionState)
], MotionController.prototype, "getProperties", null);
__decorate([
    (0, common_1.Post)('actions/detect'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", motion_dto_1.MotionState)
], MotionController.prototype, "detect", null);
__decorate([
    (0, common_1.Post)('actions/clear'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", motion_dto_1.MotionState)
], MotionController.prototype, "clear", null);
__decorate([
    (0, common_1.Post)('actions/toggle'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", motion_dto_1.MotionState)
], MotionController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)('actions/reset'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", motion_dto_1.MotionState)
], MotionController.prototype, "reset", null);
exports.MotionController = MotionController = __decorate([
    (0, common_1.Controller)('motion'),
    __metadata("design:paramtypes", [motion_service_1.MotionService])
], MotionController);
//# sourceMappingURL=motion.controller.js.map
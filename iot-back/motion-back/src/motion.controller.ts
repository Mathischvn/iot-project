import { Body, Controller, Get, Post } from '@nestjs/common';
import { MotionService } from './motion.service';
import { UpdateArmedDto, UpdateSensitivityDto, TriggerDto } from './motion.dto';

@Controller('motion')
export class MotionController {
  constructor(private readonly motionService: MotionService) {}

  // === Thing Description ===
  @Get()
  getDescription() {
    return this.motionService.getDescription();
  }

  // === Properties ===
  @Get('properties')
  getAllProperties() {
    return this.motionService.getState();
  }

  @Get('properties/detected')
  getDetected() {
    return { detected: this.motionService.getState().detected };
  }

  @Get('properties/armed')
  getArmed() {
    return { armed: this.motionService.getState().armed };
  }

  @Get('properties/sensitivity')
  getSensitivity() {
    return { sensitivity: this.motionService.getState().sensitivity };
  }

  // === Actions ===
  @Post('actions/setArmed')
  setArmed(@Body() dto: UpdateArmedDto) {
    return this.motionService.setArmed(dto);
  }

  @Post('actions/setSensitivity')
  setSensitivity(@Body() dto: UpdateSensitivityDto) {
    return this.motionService.setSensitivity(dto);
  }

  @Post('actions/trigger')
  trigger(@Body() dto: TriggerDto) {
    return this.motionService.trigger(dto);
  }

  @Post('actions/reset')
  reset() {
    return this.motionService.reset();
  }
}

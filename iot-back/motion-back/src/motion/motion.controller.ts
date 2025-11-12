import { Controller, Get, Post, HttpCode } from '@nestjs/common';
import { MotionService } from './motion.service';
import { MotionState } from './motion.dto';

@Controller('motion')
export class MotionController {
  constructor(private readonly motionService: MotionService) {}

  @Get()
  info() {
    return { name: 'Motion Sensor', type: 'motion', status: 'active' };
  }

  @Get('properties')
  getProperties(): MotionState {
    return this.motionService.getState();
  }

  @Post('actions/detect')
  @HttpCode(200)
  detect(): MotionState {
    return this.motionService.detect();
  }

  @Post('actions/clear')
  @HttpCode(200)
  clear(): MotionState {
    return this.motionService.clear();
  }

  @Post('actions/toggle')
  @HttpCode(200)
  toggle(): MotionState {
    return this.motionService.toggle();
  }

  @Post('actions/reset')
  @HttpCode(200)
  reset(): MotionState {
    return this.motionService.reset();
  }
}
import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { LampService } from './lamp.service';
import {
  UpdatePowerDto,
  UpdateBrightnessDto,
  UpdateModeDto,
  LampState,
} from './lamp.dto';

@Controller('lamp')
export class LampController {
  constructor(private readonly lampService: LampService) {}

  @Get()
  getInfo() {
    return { name: 'Smart Lamp', type: 'lamp', status: 'active' };
  }

  @Get('description')
  getDescription() {
    return this.lampService.getDescription();
  }

  @Get('properties')
  getProperties(): LampState {
    return this.lampService.getState();
  }

  @Get('properties/power')
  getPower() {
    const state = this.lampService.getState();
    return { value: state.power };
  }

  @Get('properties/brightness')
  getBrightness() {
    const state = this.lampService.getState();
    return { value: state.brightness };
  }

  @Get('properties/mode')
  getMode() {
    const state = this.lampService.getState();
    return { value: state.mode };
  }

  @Put('properties/power')
  @HttpCode(200)
  setPower(@Body() dto: UpdatePowerDto): LampState {
    return this.lampService.setPower(dto);
  }

  @Put('properties/brightness')
  @HttpCode(200)
  setBrightness(@Body() dto: UpdateBrightnessDto): LampState {
    return this.lampService.setBrightness(dto);
  }

  @Put('properties/mode')
  @HttpCode(200)
  setMode(@Body() dto: UpdateModeDto): LampState {
    return this.lampService.setMode(dto);
  }

  @Post('actions/setPower')
  @HttpCode(200)
  actionSetPower(@Body() dto: UpdatePowerDto): LampState {
    return this.lampService.setPower(dto);
  }

  @Post('actions/setBrightness')
  @HttpCode(200)
  actionSetBrightness(@Body() dto: UpdateBrightnessDto): LampState {
    return this.lampService.setBrightness(dto);
  }

  @Post('actions/setMode')
  @HttpCode(200)
  actionSetMode(@Body() dto: UpdateModeDto): LampState {
    return this.lampService.setMode(dto);
  }

  @Post('actions/reset')
  @HttpCode(200)
  actionReset(): LampState {
    return this.lampService.reset();
  }
}

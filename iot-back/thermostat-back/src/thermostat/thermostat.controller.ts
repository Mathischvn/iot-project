import { Controller, Get, Put, Post, Body, HttpCode } from '@nestjs/common';
import { ThermostatService } from './thermostat.service';
import {
  UpdateTargetDto,
  UpdateModeDto,
  ThermostatState,
} from './thermostat.dto';

@Controller('thermostat')
export class ThermostatController {
  constructor(private readonly thermostatService: ThermostatService) {}

  @Get()
  getInfo() {
    return { name: 'Smart Thermostat', type: 'thermostat', status: 'active' };
  }

  @Get('description')
  getDescription() {
    return this.thermostatService.getDescription();
  }

  @Get('properties')
  getProperties(): ThermostatState {
    return this.thermostatService.getState();
  }

  @Get('properties/temperature')
  getTemperature() {
    const state = this.thermostatService.getState();
    return { value: state.temperature, unit: 'celsius' };
  }

  @Get('properties/targetTemperature')
  getTargetTemperature() {
    const state = this.thermostatService.getState();
    return { value: state.targetTemperature, unit: 'celsius' };
  }

  @Get('properties/mode')
  getMode() {
    const state = this.thermostatService.getState();
    return { value: state.mode };
  }

  @Get('properties/isHeating')
  getIsHeating() {
    const state = this.thermostatService.getState();
    return { value: state.isHeating };
  }

  @Put('properties/targetTemperature')
  @HttpCode(200)
  setTargetTemperature(@Body() dto: UpdateTargetDto): ThermostatState {
    return this.thermostatService.setTargetTemperature(dto);
  }

  @Put('properties/mode')
  @HttpCode(200)
  setMode(@Body() dto: UpdateModeDto): ThermostatState {
    return this.thermostatService.setMode(dto);
  }

  @Post('actions/setTargetTemperature')
  @HttpCode(200)
  actionSetTargetTemperature(@Body() dto: UpdateTargetDto): ThermostatState {
    return this.thermostatService.setTargetTemperature(dto);
  }

  @Post('actions/setMode')
  @HttpCode(200)
  actionSetMode(@Body() dto: UpdateModeDto): ThermostatState {
    return this.thermostatService.setMode(dto);
  }

  @Post('actions/reset')
  @HttpCode(200)
  actionReset(): ThermostatState {
    return this.thermostatService.reset();
  }
}

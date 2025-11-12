import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

//@UseGuards(JwtAuthGuard) // A activer pour protéger tout le gateway
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('register')
  register(@Body() thing: any) {
    return this.gatewayService.register(thing);
  }

  @Post('gateway/update')
  updateFromService(
    @Body() body: { type: 'thermostat' | 'lamp' | 'motion'; state: any },
  ) {
    return this.gatewayService.notifyClients(body.type, body.state);
  }

  @UseGuards(JwtAuthGuard)
  @Get('things')
  listThings() {
    return this.gatewayService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('things/type/:type')
  listByType(@Param('type') type: string) {
    return this.gatewayService.getAllByType(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('things/:type/properties')
  getAllProperties(@Param('type') type: string) {
    return this.gatewayService.getAllPropertys(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('things/:type/properties/:prop')
  getProperty(@Param('type') type: string, @Param('prop') prop: string) {
    return this.gatewayService.getProperty(type, prop);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('things/:id/state')
  setState(@Param('id') id: string, @Body() body: any) {
    return this.gatewayService.updateState(Number(id), body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('things/:type/actions/:action')
  callAction(
    @Param('type') type: string,
    @Param('action') action: string,
    @Body() body: any,
  ) {
    return this.gatewayService.callActionFromUser(type, action, body);
  }
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'lamp',
      timestamp: new Date().toISOString(),
    };
  }
}

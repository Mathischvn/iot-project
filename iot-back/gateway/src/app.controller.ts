import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
import {GatewayService} from './app.service';

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
  ) {}

  // Enregistrement d'un service (lamp, motion, thermostat, etc.)
  @Post('register')
  async register(@Body() thing: any) {
    const saved = await this.gatewayService.register(thing);
    console.log('✅ Thing enregistré :', saved.name);
    return saved;
  }

  // Lister tous les "things"
  @Get('things')
  async getAll() {
    return this.gatewayService.getAll();
  }

  // Détails d'un thing
  @Get('things/:id')
  async getOne(@Param('id') id: string) {
    return this.gatewayService.getOne(Number(id));
  }

  // Lire une propriété (ex: température, état de la lampe)
  @Get('things/:id/:type/properties/:prop')
  async getProperty(@Param('id') id: string, @Param('prop') prop: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.gatewayService.getProperty(Number(id), prop);
  }
  // Lire tous les proriété d'un thing
  @Get('things/:id/:type/properties')
  async getAllProperties(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.gatewayService.getAllPropertys(Number(id));
  }

  // Modifier localement le state (pour affichage ou synchro)
  @Patch('things/:id/state')
  async updateState(@Param('id') id: string, @Body() body: any) {
    return this.gatewayService.updateState(Number(id), body);
  }

  // Exécuter une action sur un thing (ex: turnOn, turnOff)
  @Post('things/:id/actions/:action')
  async callAction(
    @Param('id') id: string,
    @Param('action') action: string,
    @Body() body: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.gatewayService.callAction(Number(id), action, body);
  }
}

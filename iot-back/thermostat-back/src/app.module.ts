import { Module } from '@nestjs/common';
import { ThermostatModule } from './thermostat/thermostat.module';

@Module({
  imports: [ThermostatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

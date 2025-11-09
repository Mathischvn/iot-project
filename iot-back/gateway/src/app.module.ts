import { Module } from '@nestjs/common';
import { GatewayController } from './app.controller';
import { GatewayService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class AppModule {}

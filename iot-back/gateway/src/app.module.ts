import { Module } from '@nestjs/common';
import { GatewayController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { GatewayService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule, AuthModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class AppModule {}

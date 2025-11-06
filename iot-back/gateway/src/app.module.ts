import { Module } from '@nestjs/common';
import { GatewayController} from './app.controller';
import { GatewayService } from './app.service';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class AppModule {}

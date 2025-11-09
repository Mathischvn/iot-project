import { Module } from '@nestjs/common';
import { LampModule } from './lamp/lamp.module';

@Module({
  imports: [LampModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

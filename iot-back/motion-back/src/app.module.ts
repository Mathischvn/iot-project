import { Module } from '@nestjs/common';
import { MotionService } from './motion.service';
import { MotionController } from './motion.controller';
@Module({
  controllers: [MotionController],
  providers: [MotionService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MotionService } from './motion/motion.service';
import { MotionController } from './motion/motion.controller';
@Module({
  controllers: [MotionController],
  providers: [MotionService],
})
export class AppModule {}

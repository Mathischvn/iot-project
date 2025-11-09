import { NestFactory } from '@nestjs/core';
import { LampModule } from './lamp/lamp.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(LampModule);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `💡 Lamp service running on http://localhost:${port}`,
    'Bootstrap',
  );
}
bootstrap();

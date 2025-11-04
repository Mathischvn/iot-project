import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  Logger.log(`🌡️  Thermostat running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();

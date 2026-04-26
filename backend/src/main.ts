import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, type INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

function enableCors(app: INestApplication) {
  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (process.env.NODE_ENV === 'production' && !raw) {
    throw new Error('ALLOWED_ORIGINS is required in production (comma-separated, e.g. https://app.example.com)');
  }
  const list = raw
    ? raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : null;
  app.enableCors({
    origin: list?.length ? list : true,
    credentials: true,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  enableCors(app);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Backend running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();

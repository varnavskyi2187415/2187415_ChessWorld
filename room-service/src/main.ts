import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(new LoggingMiddleware().use);
  app.setGlobalPrefix('room');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`HTTP server is running on http://localhost:${port}`);
}

bootstrap();

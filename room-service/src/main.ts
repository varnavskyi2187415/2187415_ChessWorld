import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  app.setGlobalPrefix('room');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`HTTP server is running on http://localhost:${port}`);
  console.log(`WebSocket server is available on ws://localhost:${port}`);
}

bootstrap();

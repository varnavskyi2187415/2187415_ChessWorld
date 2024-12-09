import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './logging.middleware';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(new LoggingMiddleware().use);
  app.setGlobalPrefix('room');

  const port = process?.env?.PORT ?? 3001;
  await app.listen(port);
  console.log(`HTTP server is running on http://localhost:${port}`);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672/`,
      ],
      queue: 'room-queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  console.log('Microservice is listening for messages');
}

bootstrap();

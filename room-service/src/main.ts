import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './logging.middleware';
import { RabbitMQConnection } from './utils/rabbitmq.connection';
import {connectRedis} from "./utils/redis.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await connectRedis();
  app.use(new LoggingMiddleware().use);
  app.setGlobalPrefix('room');

  const port = process?.env?.PORT ?? 3001;
  await app.listen(port);
  console.log(`HTTP server is running on http://localhost:${port}`);

  const rabbitMQOptions =
    RabbitMQConnection.createRabbitMQOptions('room-queue');
  app.connectMicroservice(rabbitMQOptions);

  await app.startAllMicroservices();
  console.log('Microservice is listening for messages');
}

bootstrap();

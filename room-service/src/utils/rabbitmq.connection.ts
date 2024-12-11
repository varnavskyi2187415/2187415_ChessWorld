import { DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices';
import * as process from 'node:process';

export class RabbitMQConnection {
  public static createRabbitMQOptions(queue: string): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672/`,
        ],
        queue: queue,
        queueOptions: {
          durable: true,
        },
      },
    };
  }

  public static forRoot(queue: string, providerName: string): DynamicModule {
    return ClientsModule.registerAsync([
      {
        name: providerName,
        useFactory: (): RmqOptions =>
          RabbitMQConnection.createRabbitMQOptions(queue),
      },
    ]);
  }
}

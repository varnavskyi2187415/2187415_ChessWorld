import { Module } from '@nestjs/common';
import { AppGateway } from './room.gateway';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ROOM_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672/`,
          ],
          queue: 'statistics-queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [AppGateway, RoomService],
  controllers: [RoomController],
})
export class RoomModule {}

import { Module } from '@nestjs/common';
import { AppGateway } from './room.gateway';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RabbitMQConnection } from '../utils/rabbitmq.connection';

@Module({
  imports: [RabbitMQConnection.forRoot('statistics-queue', 'ROOM_SERVICE')],
  providers: [AppGateway, RoomService],
  controllers: [RoomController],
})
export class RoomModule {}

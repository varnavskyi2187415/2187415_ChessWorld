import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RabbitMQConnection } from '../utils/rabbitmq.connection';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './entities/Attendee';
import { Room } from './entities/Room';
import {StockfishService} from "./stockfish.service";

@Module({
  imports: [
    RabbitMQConnection.forRoot('statistics-queue', 'ROOM_SERVICE'),
    RabbitMQConnection.forRoot('find-game-queue', 'USER_SERVICE'),
    RabbitMQConnection.forRoot('stop-find-game-queue', 'USER_SERVICE'),
    TypeOrmModule.forFeature([Room, Attendee]),
  ],
  providers: [RoomGateway, RoomService, StockfishService],
  controllers: [RoomController],
})
export class RoomModule {}

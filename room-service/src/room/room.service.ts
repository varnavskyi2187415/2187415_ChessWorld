import { Inject, Injectable } from '@nestjs/common';
import { RoomDto } from './room.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RoomService {
  constructor(@Inject('ROOM_SERVICE') private rabbitmqClient: ClientProxy) {}
  placeRoom(roomDto: RoomDto) {
    this.rabbitmqClient.emit('statistics-queue', roomDto);
    return { message: 'Service has placed statistics for user!' };
  }
}

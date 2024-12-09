import { Body, Controller, Post } from '@nestjs/common';
import { RoomDto } from './room.dto';
import { RoomService } from './room.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/send-message')
  sendMessage(@Body() room: RoomDto) {
    return this.roomService.placeRoom(room);
  }

  @EventPattern('room-queue')
  handleMessagePlace(@Payload() data: RoomDto) {
    console.log('Received:' + data.name);
  }
}

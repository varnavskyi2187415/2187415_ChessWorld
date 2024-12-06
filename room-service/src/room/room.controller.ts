import { Controller, Get } from '@nestjs/common';

@Controller('room')
export class RoomController {
  @Get()
  async HelloWorld() {
    return 'Hello world';
  }
}

import { Module } from '@nestjs/common';
import { AppGateway } from './room.gateway';
import { RoomController } from './room.controller';

@Module({
  providers: [AppGateway],
  controllers: [RoomController],
})
export class RoomModule {}

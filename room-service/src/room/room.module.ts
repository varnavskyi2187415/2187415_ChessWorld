import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomController } from './room.controller';

@Module({
    providers: [RoomGateway],
    controllers: [RoomController], 
})
export class RoomModule {}

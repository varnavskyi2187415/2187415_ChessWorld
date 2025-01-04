import {Body, Controller, Delete, Get, Param, Post, Query, Req} from '@nestjs/common';
import {RoomService} from './room.service';
import {EventPattern, Payload} from '@nestjs/microservices';
import {StockfishService} from "./stockfish.service";
import {GetUserIdFromReq} from "./helpers/jwtHelper";
import {RoomGateway} from "./room.gateway";
import { MatchDto } from './dtos/match.dto';

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService, private readonly chessService: StockfishService, private readonly roomGateway: RoomGateway) {
  }

  // @Post('/send-message')
  // sendMessage(@Body() room: RoomDto) {
  //   return this.roomService.placeRoom(room);
  // }

  @EventPattern('room-queue')
  async handleMessagePlace(@Payload() data: MatchDto) {
    console.log('From \'room-queue\' received:', data);
    const room = await this.roomService.createRoomForUsers(data.whiteId, data.blackId, data.timeControl);
    this.roomGateway.server.emit('roomCreated', room.id);
  }

  @Get('/')
  getRooms(@Req() request: Request) {
    return this.roomService.getRooms();
  }

  @Get('/activeRooms')
  getActiveRooms(@Req() request: Request) {
    const userId = GetUserIdFromReq(request);
    return this.roomService.getActiveRoomsByUserId(userId);
  }

  @Get('/:roomId')
  getRoomById(@Param('roomId') roomId: string) {
    return this.roomService.getRoomById(roomId);
  }

  @Delete('/:roomId')
  deleteRoomById(@Param('roomId') roomId: string) {
    return this.roomService.removeRoom(roomId);
  }

  @Get('/stockfish/analyze')
  analysePos(@Query('fen') fen: string) {
    console.log('fen', fen);
    return this.chessService.getBestMove(fen, 3);
  }
}

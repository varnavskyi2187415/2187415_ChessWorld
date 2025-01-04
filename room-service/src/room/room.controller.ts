import {Body, Controller, Delete, Get, Param, Post, Query, Req} from '@nestjs/common';
import {RoomDto} from './room.dto';
import {RoomService} from './room.service';
import {EventPattern, Payload} from '@nestjs/microservices';
import {StockfishService} from "./stockfish.service";
import {GetUserIdFromReq} from "./helpers/jwtHelper";

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService, private readonly chessService: StockfishService) {
  }

  // @Post('/send-message')
  // sendMessage(@Body() room: RoomDto) {
  //   return this.roomService.placeRoom(room);
  // }

  @EventPattern('room-queue')
  handleMessagePlace(@Payload() data: RoomDto) {
    console.log('Received:' + data.name);
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

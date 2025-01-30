import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {RoomService} from './room.service';
import {EventPattern, Payload} from '@nestjs/microservices';
import {StockfishService} from "./stockfish.service";
import {GetUserIdFromReq} from "./helpers/jwtHelper";
import {RoomGateway} from "./room.gateway";
import {MatchDto} from './dtos/match.dto';
import {IsPlayerGuardController} from "./guards/IsPlayerGuardController";
import {AuthGuard} from "./guards/AuthGuard";

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService, private readonly chessService: StockfishService, private readonly roomGateway: RoomGateway) {
  }

  @EventPattern('room-queue')
  async handleRoomPlace(@Payload() data: MatchDto) {
    console.log('From \'room-queue\' received:', data);
    const room = await this.roomService.createRoomForUsers(data.whiteId, data.blackId, data.timeControl);
    const whiteSocketId = this.getSocketIdByUserId(data.whiteId);
    const blackSocketId = this.getSocketIdByUserId(data.blackId);
    this.roomGateway.server.to(whiteSocketId).to(blackSocketId).emit('roomCreated', room.id);
  }
  
  private getSocketIdByUserId(userId: string){
    for (const [socketId, socket] of this.roomGateway.server.sockets.sockets) {
      if (socket.data['userId'] === userId) {
        return socketId;
      }
    }
  }

  @Get('/')
  getRooms(@Req() request: Request) {
    return this.roomService.getRooms();
  }

  @UseGuards(AuthGuard)
  @Get('/activeRooms')
  getActiveRooms(@Req() request: Request) {
    const userId = GetUserIdFromReq(request);
    return this.roomService.getActiveRoomsByUserId(userId);
  }

  @Get('/:roomId')
  getRoomById(@Param('roomId') roomId: string) {
    return this.roomService.getRoomById(roomId);
  }

  @Post('/surrender/:roomId')
  @UseGuards(IsPlayerGuardController)
  surrenderRoomById(@Param('roomId') roomId: string, @Req() request: Request) {
    const userId = GetUserIdFromReq(request);
    try {
      /// TODO: fuck
      return this.roomService.surrender(userId, roomId);
    } catch (error) {
      return new BadRequestException(error.message ? error.message : error);
    }
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

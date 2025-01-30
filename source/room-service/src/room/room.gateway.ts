import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {RoomService} from "./room.service";
import {Events} from "./room.emitTypes";
import {Inject, UseGuards} from "@nestjs/common";
import {IsPlayerGuardGateway} from "./guards/IsPlayerGuardGateway";
import {Attendee} from "./entities/Attendee";
import {Chess, Move} from "chess.js";
import {StockfishService} from './stockfish.service';
import {EmptyError} from "rxjs";
import {Room} from "./entities/Room";
import {ClientProxy, EventPattern, Payload} from "@nestjs/microservices";
import {FindGameDto} from "./dtos/findGame.dto";
import {StopFindGameDto} from './dtos/stopFindGame.dto';
import {ConnectionIsNotSetError} from "typeorm";

interface UserData {
  userId: string;
  userEmail: string;
}

@WebSocketGateway(4321, {namespace: '/socket.io'})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService, private readonly chessService: StockfishService, @Inject('USER_SERVICE') private rabbitmqClient: ClientProxy) {

  }

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log(`Client disconnected: ${client.id}`);
    await this.roomService.clearAllAttendees(client.id);
  }

  @SubscribeMessage(Events.setUserData)
  handleSetUserId(@ConnectedSocket() client: Socket, @MessageBody() userData: UserData) {
    console.log(`[${client.id}] set user data: userId: ${userData.userId}, email: ${userData.userEmail}`)
    client.data.userId = userData.userId;
    client.data.userEmail = userData.userEmail;
    this.server.to(client.id).emit('userDataSet');
  }

  @SubscribeMessage(Events.createRoom)
  async handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    selectedSide: string,
    timeControl: string,
  }): Promise<void> {
    console.log(`[${client.id}] wants to create room with side ${payload.selectedSide} and ${payload.timeControl} timecontrol`);
    const {userId, userEmail} = client.data;
    const room = await this.roomService.createEmptyRoom(userId, userEmail, payload.selectedSide, payload.timeControl);
    this.server.to(client.id).emit('roomCreated', room.id);
  }


  @SubscribeMessage(Events.deleteRoom)
  async handleDeleteRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }): Promise<void> {
    console.log(`[${client.id}] wants to delete ${payload.roomId} room`);
    await this.roomService.deleteRoom(payload.roomId);
    this.server.to(payload.roomId).emit('roomDeleted', payload.roomId);
  }

  async handleBotGame(room: Room, handleTimeRunOut: (side: string) => void) {
    const botSide: "w" | "b" | null = this.roomService.getBotSide(room.gamePGN);
    if (botSide === 'w' || botSide === 'b') {
      // handle stockfish move
      const game = new Chess();
      game.loadPgn(room.gamePGN);
      const bestMove = await this.chessService.getBestMove(game.fen(), room.stockfishDepth);
      return await this.roomService.handleMove(room.id, bestMove, handleTimeRunOut);
    }
    return room;
  }

  @SubscribeMessage(Events.startGameWithBot)
  async handleStartGameWithBot(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    selectedSide: string,
    botDepth: number,
    timeControl: string;
  }): Promise<void> {
    console.log(`[${client.id}] want to start game with stockfish on depth ${payload.botDepth}`);
    const {userId, userEmail} = client.data;
    const room = await this.roomService.createRoomWithBot(userId, userEmail, payload.selectedSide, payload.botDepth, payload.timeControl);
    
    if (room.whiteUserId !== this.roomService.tempGetUUIDForStockfish()) {
      this.server.to(client.id).emit('roomCreated', room.id);
      return;
    }
    
    const updatedRoom = await this.handleBotGame(room, (side: string) => this.handleTimeRunOut(client, {
      roomId: room.id,
      side: side
    }));
    this.server.to(client.id).emit('roomCreated', updatedRoom.id);
  }

  @SubscribeMessage(Events.startGame)
  async handleStartGame(@ConnectedSocket() client: Socket, @Payload() payload: { timeControl: string }): Promise<void> {
    console.log(`[${client.id}] starts finding game`);
    this.rabbitmqClient.emit('find-game-queue', new FindGameDto(client.data.userEmail, client.data.userId, payload.timeControl));
  }

  @SubscribeMessage(Events.stopGameFind)
  async handleStopFindGame(@ConnectedSocket() client: Socket): Promise<void> {
    console.log(`[${client.id}] stops finding game`);
    this.rabbitmqClient.emit('stop-find-game-queue', new StopFindGameDto(client.data.userEmail, client.data.userId));
  }

  @SubscribeMessage(Events.joinRoom)
  async handleRoomJoined(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string;
  }) {
    console.log(`[${client.id}]: ${client.data.userId} is joining ${payload.roomId}`)
    const user = {userId: client.data.userId, socketId: client.id} as Attendee;
    try {
      const oldSocketId = await this.roomService.addAttendeeToRoom(payload.roomId, user);
      oldSocketId ? console.log("Old socket: ", oldSocketId) : console.log("No old connection found");
      const room = await this.roomService.getRoomById(payload.roomId);
      this.server.to(payload.roomId).emit('userJoined', user);
      if (oldSocketId) {
        this.server.to(oldSocketId).socketsLeave(payload.roomId);
        this.server.to(oldSocketId).emit('joinedOnOtherDevice');
      }
      
      this.server.to(client.id).socketsJoin(payload.roomId);
      this.server.to(payload.roomId).emit('roomData', room);
      await this.handleGetTime(client, payload);
    } catch (error) {
      this.server.to(client.id).emit('joinError', error.message ? error.message : error)
    }
  }

  @SubscribeMessage(Events.leaveRoom)
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string;
  }) {
    console.log(`[${client.id}]: ${client.data.userId} is leaving ${payload.roomId}`)
    const user = {userId: client.data.userId, socketId: client.id} as Attendee;
    await this.roomService.removeAttendeeFromRoom(client.id, payload.roomId);
    this.server.to(client.id).socketsLeave(payload.roomId);
    this.server.to(payload.roomId).emit('userLeaved', user);
  }

  @SubscribeMessage(Events.handleMove)
  @UseGuards(IsPlayerGuardGateway)
  async handleMove(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
    move: Move | string,
  }): Promise<void> {
    console.log(
      `[${client.id}] makes move in ${payload.roomId}: ${(payload.move as Move).san}`,
    );
    const room = await this.roomService.handleMove(
      payload.roomId,
      payload.move,
      (side: string) => this.handleTimeRunOut(client, {
        ...payload,
        side: side
      }));
    if (room.gameStatus !== 'The game is still ongoing.' && room.gameStatus !== '') {
      this.server.to(room.id).emit('roomData', room);
      await this.handleGetTime(client, payload);
      return;
    }
    const updatedRoom = await this.handleBotGame(room, (side: string) => this.handleTimeRunOut(client, {
      roomId: room.id,
      side: side
    }));
    this.server.to(room.id).emit('roomData', updatedRoom);
    await this.handleGetTime(client, payload);
  }

  @SubscribeMessage(Events.getTime)
  async handleGetTime(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }): Promise<void> {
    console.log(`[${client.id}] wants time for ${payload.roomId}`);
    const room = await this.roomService.getRoomById(payload.roomId);
    const time = this.roomService.getTimeForGame(room.gamePGN);
    this.server.to(room.id).emit('currentTime', time);
  }

  @SubscribeMessage(Events.handleOfferDraw)
  @UseGuards(IsPlayerGuardGateway)
  async handleOfferDraw(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }) {
    console.log(`[${client.id}] is proposing draw in ${payload.roomId} room`);
    const opponentsSocketId = await this.roomService.getSocketIdOfOpponent(client.data.userId, payload.roomId);
    this.server.to(opponentsSocketId).emit('drawPropose');
  }

  @SubscribeMessage(Events.acceptDraw)
  @UseGuards(IsPlayerGuardGateway)
  async handleDrawAccepted(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }) {
    console.log(`[${client.id}] accepted draw in ${payload.roomId} room`);
    const room = await this.roomService.draw(payload.roomId);
    this.server.to(room.id).emit('roomData', room);
  }

  @SubscribeMessage(Events.denyDraw)
  @UseGuards(IsPlayerGuardGateway)
  async handleDrawDenied(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }) {
    console.log(`[${client.id}] denied draw in ${payload.roomId} room.`);
    const opponentsSocketId = await this.roomService.getSocketIdOfOpponent(client.data.userId, payload.roomId);
    this.server.to(opponentsSocketId).emit('drawDenied');
  }

  @SubscribeMessage(Events.surrender)
  @UseGuards(IsPlayerGuardGateway)
  async handleSurrender(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }) {
    console.log(`[${client.id}] surrender in ${payload.roomId} room.`);
    try {
      const room = await this.roomService.surrender(client.data.userId, payload.roomId);
      this.server.to(room.id).emit('roomData', room);
    } catch (error) {
      this.server.to(client.id).emit('generalError', error.message ? error.message : error)
    }
  }

  @SubscribeMessage(Events.timeRunOut)
  @UseGuards(IsPlayerGuardGateway)
  async handleTimeRunOut(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string;
    side: string;
  }) {
    console.log(`In [${payload.roomId}] side ${payload.side} time run out`);
    const room = await this.roomService.sideLoseOnTime(payload.roomId, payload.side);
    this.server.to(room.id).emit('roomData', room);
  }

  @SubscribeMessage('error')
  handleError(client: Socket, error: string): void {
    console.log(`Error with client ${client.id}: ${error}`);
  }
}

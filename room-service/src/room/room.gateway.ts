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
import {IsPlayerGuard} from "./guards/IsPlayerGuard";
import {Attendee} from "./entities/Attendee";
import {Chess, Move} from "chess.js";
import {StockfishService} from './stockfish.service';
import {EmptyError} from "rxjs";
import {Room} from "./entities/Room";
import {ClientProxy, EventPattern, Payload} from "@nestjs/microservices";
import {RoomDto} from "./room.dto";
import {UserDto} from "../user/user.dto";

interface UserData {
  userId: string;
  userEmail: string;
}

@WebSocketGateway(4321, {namespace: '/socket.io'})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService, private readonly chessService: StockfishService, @Inject('USER_SERVICE') private rabbitmqClient: ClientProxy) {

  }

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
    //this.server.emit('room', `${client.id} joined!`);
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

  @SubscribeMessage('customName')
  handleMessage(client: Socket, message: string): void {
    console.log(`[${client.id}] sent message: ${message}`);
    console.log(`userId: ${client}`);
    this.server.emit('room', `[${client.id}] -> ${message}`);
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

  @EventPattern('room-queue')
  handleMessagePlace(@Payload() data: RoomDto) {
    console.log('Received:' + data.name);
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
    const isBotGame: "w" | "b" | null = this.roomService.isBotGame(room.gamePGN);

    if (isBotGame === 'w' || isBotGame === 'b') {
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
    const updatedRoom = await this.handleBotGame(room, (side: string) => this.handleTimeRunOut(client, {
      roomId: room.id,
      side: side
    }));
    this.server.to(client.id).emit('roomCreated', updatedRoom.id);
  }

  @SubscribeMessage(Events.startGame)
  async handleStartGame(@ConnectedSocket() client: Socket): Promise<void> {
    console.log(`[${client.id}] starts finding game`);
    this.rabbitmqClient.emit('find-game-queue', new UserDto(client.data.userId, client.data.userEmail));
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
  @UseGuards(IsPlayerGuard)
  async handleMove(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
    move: Move | string,
  }): Promise<void> {
    console.log(
      `[${client.id}] makes move in ${payload.roomId}: ${(payload.move as Move).san}`,
    );
    /// TODO: start timer till end of game
    const room = await this.roomService.handleMove(payload.roomId, payload.move, (side: string) => this.handleTimeRunOut(client, {
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
    !room && console.log('room', room);
    const time = this.roomService.getTimeForGame(room.gamePGN);
    this.server.to(room.id).emit('currentTime', time);
  }

  @SubscribeMessage(Events.pauseRoom)
  @UseGuards(IsPlayerGuard)
  async handlePauseGame(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
  }) {
    console.log(`[${client.id}] wants pause ${payload.roomId}`);
    const room = await this.roomService.pauseRoom(payload.roomId);
    this.server.to(payload.roomId).emit('roomData', room);
  }

  /// TODO: handle draw offer
  @SubscribeMessage(Events.handleOfferDraw)
  @UseGuards(IsPlayerGuard)
  handleOfferDraw(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string,
    move: Move | string,
  }) {
    this.server.fetchSockets()
  }

  @SubscribeMessage(Events.timeRunOut)
  @UseGuards(IsPlayerGuard)
  async handleTimeRunOut(@ConnectedSocket() client: Socket, @MessageBody() payload: {
    roomId: string;
    side: string;
  }) {
    console.log(`In [${payload.roomId}] side ${payload.side} time run out`);
    const room = await this.roomService.sideLoseOnTime(payload.roomId, payload.side);
    this.server.to(room.id).emit('roomData', room);
  }

  /// TODO: handle resignation
  /// TODO: clean code


  @SubscribeMessage('error')
  handleError(client: Socket, error: string): void {
    console.log(`Error with client ${client.id}: ${error}`);
  }
}

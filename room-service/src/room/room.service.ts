import {Inject, Injectable, NotImplementedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Room} from "./entities/Room";
import {Repository} from "typeorm";
import {Attendee} from "./entities/Attendee";
import {Chess, Move} from "chess.js";
import {StockfishService} from "./stockfish.service";
import {ClientProxy} from "@nestjs/microservices";
import {RoomDto} from "./dtos/room.dto";

@Injectable()
export class RoomService {
  constructor(
    @Inject('ROOM_SERVICE') private rabbitmqClient: ClientProxy,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Attendee) private attendeesRepo: Repository<Attendee>,
    @Inject() private readonly chessService: StockfishService,
  ) {
  }

  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  getPlayersForBotGame(player: Attendee, stockfish: Attendee, selectedSide: string): {
    whitePlayer: Attendee,
    blackPlayer: Attendee
  } {
    let whitePlayer: Attendee, blackPlayer: Attendee;
    switch (selectedSide) {
      case 'r':
        if (Math.random() > 0.5) {
          whitePlayer = player;
          blackPlayer = stockfish;
        } else {
          whitePlayer = stockfish;
          blackPlayer = player;
        }
        break;
      case 'w':
        whitePlayer = player;
        blackPlayer = stockfish;
        break;
      case 'b':
        whitePlayer = stockfish;
        blackPlayer = player;
        break;
    }
    return {whitePlayer, blackPlayer};
  }

  getStartTime(timeControl: string) {
    return +timeControl.split('|')[0];
  }

  getIncrement(timeControl: string) {
    return +timeControl.split('|')[1];
  }

  isBotGame(pgn: string): 'w' | 'b' | null {
    const game = new Chess();
    game.loadPgn(pgn.normalize("NFD"));
    const headers = game.header();
    if (headers['White'] === this.tempGetUUIDForStockfish()) {
      return 'w';
    } else if (headers['Black'] === this.tempGetUUIDForStockfish()) {
      return 'b';
    } else {
      return null;
    }
  }

  isAttendeePlayer(userId: string, room: Room) {
    if (room.whiteUserId === '' || room.blackUserId === '') {
      return true;
    }
    const game = new Chess();
    game.loadPgn(room.gamePGN);
    const headers = game.header();
    return headers['White'] === userId || headers['Black'] === userId;
  }

  isOnlyOnePlayer(room: Room, userId: string) {
    if (room.whiteUserId === '' && room.blackUserId !== userId)
      return 'w';
    if (room.blackUserId === '' && room.whiteUserId !== userId)
      return 'b';
    return false;
  }

  getGameStatus(game: Chess) {
    if (game.getComments().length === 0) return '';

    if (!game.isGameOver()) return 'The game is still ongoing.';

    if (game.isStalemate()) return 'Draw. stalemate.';

    if (game.isInsufficientMaterial()) return 'Draw. insufficient material.';

    if (game.isThreefoldRepetition()) return 'Draw. threefold repetition.';

    if (game.isDraw()) return 'Draw.';

    if (game.isCheckmate()) return `Checkmate. ${game.turn() === "w" ? "Black" : "White"} wins.`;

    if (game.header()['Result'] === '1-0')
      return 'White wins.'

    if (game.header()['Result'] === '0-1')
      return 'Black wins.'

    if (game.header()['Result'] === '1/2-1/2')
      return 'Draw. By agreement.'

    throw new NotImplementedException();
  }

  placeRoomInStatistic(room: Room) {
    const roomDto = new RoomDto(room.id, room.title, room.whiteUserId, room.blackUserId, room.gamePGN, room.gameStatus, room.stockfishDepth);
    this.rabbitmqClient.emit('statistics-queue', roomDto);
    return {message: 'Service has placed statistics for user!'};
  }

  async createRoomWithBot(userId: string, userEmail: string, selectedSide: string, botDepth: number, timeControl: string): Promise<Room> {
    const player = new Attendee();
    player.userId = userId;

    const stockfish = new Attendee();
    stockfish.userId = this.tempGetUUIDForStockfish();
    stockfish.isPlayer = true;

    const game = new Chess();
    const {whitePlayer, blackPlayer} = this.getPlayersForBotGame(player, stockfish, selectedSide);

    game.header('White', whitePlayer.userId);
    game.header('Black', blackPlayer.userId);
    game.header('Date', (new Date()).toUTCString());
    game.header('TimeControl', timeControl);

    const room = new Room();
    room.title = `Game with stockfish of ${userEmail}`;
    room.whiteUserId = whitePlayer.userId;
    room.blackUserId = blackPlayer.userId;
    room.gamePGN = game.pgn();
    room.gameStatus = this.getGameStatus(game);
    room.attendees = [stockfish];
    room.stockfishDepth = botDepth;
    await this.roomRepo.save(room);
    stockfish.room = room;
    await this.attendeesRepo.save(stockfish);
    return room;
  }

  async createEmptyRoom(userId: string, userEmail: string, selectedSide: string, timeControl: string): Promise<Room> {
    const player = new Attendee();
    player.userId = userId;
    player.isPlayer = true;

    const game = new Chess();
    game.header('TimeControl', timeControl);

    const room = new Room();
    if (selectedSide === 'w') {
      game.header('White', player.userId);
      room.whiteUserId = player.userId;
    } else {
      game.header('Black', player.userId);
      room.blackUserId = player.userId;
    }

    game.header('Date', (new Date()).toUTCString());

    room.title = `Game of ${userEmail}`;
    room.gamePGN = game.pgn();
    room.gameStatus = this.getGameStatus(game);
    room.attendees = [player];
    await this.roomRepo.save(room);
    player.room = room;
    await this.attendeesRepo.save(player);
    return room;
  }

  async createRoomForUsers(whiteId: string, blackId: string, timeControl: string) {
    const white = new Attendee();
    white.userId = whiteId;
    white.isPlayer = true;

    const black = new Attendee();
    black.userId = blackId;
    black.isPlayer = true;

    const game = new Chess();
    game.header('TimeControl', timeControl);
    game.header('White', white.userId);
    game.header('Black', black.userId);
    game.header('Date', (new Date()).toUTCString());

    const room = new Room();
    room.title = `Game of ${whiteId} vs ${blackId}`
    room.whiteUserId = whiteId;
    room.blackUserId = blackId;
    room.gamePGN = game.pgn();
    room.gameStatus = this.getGameStatus(game);
    room.attendees = [white, black];
    await this.roomRepo.save(room);
    white.room = room;
    black.room = room;
    await this.attendeesRepo.save(white);
    await this.attendeesRepo.save(black);
    return room;
  }

  tempGetUUIDForStockfish() {
    return '8b891612-43dc-48f1-9a9b-1effc3a4f121';
  }

  async addRoom(title: string, host: Attendee): Promise<void> {
    const room = await this.getRoomByTitle(title);
    if (!room) {
      const newRoom = {title, gamePGN: "", attendees: [host]} as Room;
      await this.roomRepo.save(newRoom);
    }
  }

  async removeRoom(id: string): Promise<void> {
    const findRoom = await this.getRoomById(id)
    if (findRoom) {
      await this.roomRepo.delete({id: id});
    }
  }

  async pauseRoom(id: string): Promise<void> {
    const findRoom = await this.getRoomById(id)
    if (findRoom) {
      findRoom.gameStatus = '';
      await this.roomRepo.save(findRoom);
    }
  }

  async getRoomPlayers(id: string): Promise<Attendee[]> {
    const room = await this.getRoomById(id)
    if (room)
      return room.attendees.filter(a => a.isPlayer === true);
    return null;
  }

  async getRoomByTitle(title: string): Promise<Room> {
    //return await this.roomRepo.findOneBy({title: title});
    return await this.roomRepo.createQueryBuilder('room')
      .leftJoinAndSelect('room.attendees', 'attendee')
      .where('room.title = :title', {title})
      .getOne();
  }

  async getRoomById(id: string): Promise<Room> {
    return await this.roomRepo.createQueryBuilder('room')
      .leftJoinAndSelect('room.attendees', 'attendee')
      .where('room.id = :id', {id})
      .getOne();
  }

  async addAttendeeToRoom(id: string, user: Attendee): Promise<void | string> {
    const room = await this.getRoomById(id)
    if (!room) {
      throw "Room not found";
    }
    const isOnlyOnePlayer = this.isOnlyOnePlayer(room, user.userId);
    if (isOnlyOnePlayer) {
      const game = new Chess();
      game.loadPgn(room.gamePGN, {strict: false});
      if (isOnlyOnePlayer === 'w') {
        room.whiteUserId = user.userId;
        game.header('White', user.userId);
      } else if (isOnlyOnePlayer === 'b') {
        room.blackUserId = user.userId;
        game.header('Black', user.userId);
      }
      room.gamePGN = game.pgn();
      user.isPlayer = true;
      user.room = room;
      await this.roomRepo.save(room);
      await this.attendeesRepo.save(user);
      return;
    }

    // is Attendee player
    user.isPlayer = this.isAttendeePlayer(user.userId, room);

    const players = await this.getRoomPlayers(id);
    const playerThatChangedSocket = players.find(a => a.userId === user.userId);
    if (playerThatChangedSocket) {
      const oldSocketId = playerThatChangedSocket.socketId;
      playerThatChangedSocket.socketId = user.socketId;
      await this.attendeesRepo.save(playerThatChangedSocket);
      await this.roomRepo.save(room);
      return oldSocketId;
    } else {
      await this.attendeesRepo.save(user);
      room.attendees.push(user);
    }
    await this.roomRepo.save(room);
  }

  async getRoomsBySocketId(socketId: string): Promise<Room[]> {
    return this.roomRepo
      .createQueryBuilder("room")
      .innerJoinAndSelect("room.users", "user")
      .where("user.socketId = :socketId", {socketId})
      .getMany();
  }

  async removeAttendeeFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.getRoomsBySocketId(socketId)
    for (const room of rooms) {
      await this.removeAttendeeFromRoom(socketId, room.id)
    }
  }

  async removeAttendeeFromRoom(socketId: string, roomId: string): Promise<void> {
    const room = await this.getRoomById(roomId)
    room.attendees = room.attendees.filter(a => a.socketId !== socketId);
    await this.attendeesRepo.delete({socketId: socketId});
    if (room.attendees.length === 0)
      await this.removeRoom(roomId);
    await this.roomRepo.save(room);
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.roomRepo.delete({id: roomId});
  }

  async getRooms(): Promise<Room[]> {
    return this.roomRepo.find();
  }

  async getActiveRoomsByUserId(userId: string): Promise<Room[]> {
    return this.roomRepo.find({
      where: [
        {whiteUserId: userId},
        {blackUserId: userId}
      ]
    });
  }

  async handleMove(roomId: string, move: Move | string, handleTimeRunOut: (side: string) => void): Promise<Room> {
    const room = await this.getRoomById(roomId);
    if (room.attendees.length < 2)
      return room;

    const game = new Chess();
    game.loadPgn(room.gamePGN.normalize("NFD"));
    if (game.move(move)) {
      game.setComment(`${new Date().getTime()}`);
      const times = this.getTimeForGame(game.pgn());
      this.timers.delete(roomId);
      const timer = setTimeout(async () => {
        await this.sideLoseOnTime(roomId, game.turn());
        handleTimeRunOut(game.turn());
      }, (game.turn() === 'w' ? times.whiteTime : times.blackTime) * 1000);
      this.timers.set(room.id, timer);
      room.gameStatus = this.getGameStatus(game);
      room.gamePGN = game.pgn();
      await this.roomRepo.save(room);
      return room;
    }
  }

  getActualTime(game: Chess, initialTime: number, increment: number) {
    let whiteTime = initialTime, blackTime = initialTime;
    const comments = game.getComments();
    if (comments.length < 1)
      return {whiteTime, blackTime};

    const firstStamp = +comments[0].comment
    const timestamps = comments
      .map(node => (+node.comment - firstStamp) / 1000);

    let index = 0;
    while (true) {
      if (index === timestamps.length - 1) {
        if (game.isGameOver() || game.header()['Result'] === '0-1' || game.header()['Result'] === '1-0' || game.header()['Result'] === '1/2-1/2') {
          if (game.header()['Result'] === '1-0' && game.header()['Termination'] === 'time forfeit')
            blackTime = 0;
          else if (game.header()['Result'] === '0-1' && game.header()['Termination'] === 'time forfeit')
            whiteTime = 0;
          break;
        }

        const timeBetweenMoves = (new Date().getTime() - firstStamp) / 1000 - timestamps[index];
        if (index % 2 != 0) {
          whiteTime -= timeBetweenMoves;
        } else {
          blackTime -= timeBetweenMoves;
        }
        break;
      }


      const timeBetweenMoves = timestamps[index + 1] - timestamps[index];
      if (index % 2 != 0) {
        whiteTime -= timeBetweenMoves;
        whiteTime += increment;
      } else {
        blackTime -= timeBetweenMoves;
        blackTime += increment;
      }
      index += 1;
    }
    return {whiteTime, blackTime};
  }

  getTimeForGame(pgn: string): { whiteTime: number, blackTime: number } {
    const game = new Chess();
    game.loadPgn(pgn.normalize("NFD"));
    const timeControl = game.header()['TimeControl'];
    const startTime = this.getStartTime(timeControl) * 60;
    const increment = this.getIncrement(timeControl);
    return this.getActualTime(game, startTime, increment);
  }

  async sideLoseOnTime(roomId: string, side: string) {
    const room = await this.getRoomById(roomId);
    const game = new Chess();
    game.loadPgn(room.gamePGN);
    game.header('Termination', 'time forfeit');
    if (!game.header()['Result'])
      game.header('Result', side === 'w' ? '1-0' : '0-1');
    room.gamePGN = game.pgn();
    room.gameStatus = `Lost on time. ${game.turn() === "w" ? "Black" : "White"} wins.`;
    await this.roomRepo.save(room);
    this.placeRoomInStatistic(room);
    return room;
  }

  async isPlayerInRoom(userId: string, roomId: string) {
    return await this.roomRepo.exists({
      where: [
        {id: roomId, whiteUserId: userId},
        {id: roomId, blackUserId: userId}
      ]
    });
  }

  async clearAllAttendees(socketId: string) {
    return await this.attendeesRepo.delete({socketId: socketId});
  }

  async getSocketIdOfOpponent(userId: string, roomId: string) {
    const room = await this.getRoomById(roomId);
    console.log('ROOOOM', room)
    const opponentId = room.whiteUserId === userId ? room.blackUserId : room.whiteUserId;
    console.log('opponentId', opponentId);
    console.log('playerId', userId);
    return room.attendees.filter(a => a.userId === opponentId)[0]?.socketId;
  }

  async draw(roomId: string) {
    const room = await this.getRoomById(roomId);
    const game = new Chess();
    game.loadPgn(room.gamePGN);
    game.header('Termination', 'draw agreement');
    if (!game.header()['Result'])
      room.gamePGN = `${game.pgn()} 1/2-1/2`
    room.gameStatus = `Draw. Agreement.`;
    await this.roomRepo.save(room);
    this.placeRoomInStatistic(room);
    return room;
  }

  async surrender(userId: string, roomId: string) {
    const room = await this.getRoomById(roomId);
    const game = new Chess();
    game.loadPgn(room.gamePGN);
    game.header('Termination', 'surrender');
    if (!game.header()['Result']) {
      const result = userId === room.whiteUserId ? '0-1' : '1-0';
      game.header('Result', result);
    }
    room.gamePGN = game.pgn();
    room.gameStatus = `Surrender. ${userId === room.whiteUserId ? 'Black' : 'White'} wins.`;
    await this.roomRepo.save(room);
    this.placeRoomInStatistic(room);
    return room;
  }
}

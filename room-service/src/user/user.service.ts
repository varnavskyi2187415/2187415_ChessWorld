import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {FindGameDto} from "../room/dtos/findGame.dto";

@Injectable()
export class UserService {
  constructor(@Inject('USER_SERVICE') private rabbitmqClient: ClientProxy) {}
  findGame(userDto: FindGameDto) {
    this.rabbitmqClient.emit('find-game-queue', userDto);
    return { message: 'Service has placed user to find the game!' };
  }
}

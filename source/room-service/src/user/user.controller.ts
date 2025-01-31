import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import {FindGameDto} from "../room/dtos/findGame.dto";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/find-game')
  findGame(@Body() findGame: FindGameDto) {
    return this.userService.findGame(findGame);
  }
}

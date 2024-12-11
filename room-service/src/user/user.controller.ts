import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/find-game')
  findGame(@Body() user: UserDto) {
    return this.userService.findGame(user);
  }
}

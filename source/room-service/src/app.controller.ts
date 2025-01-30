import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/auth')
  getHello() {
    console.log('HEllo!!!!');
    return { msg: 'Hello world!!!!!' };
  }

  @Get('/hello')
  getApi() {
    return { msg: 'Hello Api!!!!!' };
  }
}

import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {RoomModule} from './room/room.module';
import {LoggingMiddleware} from './logging.middleware';
import {UserModule} from './user/user.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {mySqlConfig} from "./data-source";

@Module({
  imports: [RoomModule, UserModule, TypeOrmModule.forRoot(mySqlConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

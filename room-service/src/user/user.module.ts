import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RabbitMQConnection } from '../utils/rabbitmq.connection';

@Module({
  imports: [RabbitMQConnection.forRoot('find-game-queue', 'USER_SERVICE')],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

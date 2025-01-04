import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Attendee } from './room/entities/Attendee';
import { Room } from './room/entities/Room';

export const mySqlConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'mysql',
  port: 3306,
  username: 'room-user',
  password: 'password',
  database: 'room-service',
  synchronize: true,
  logging: false,
  entities: [Attendee, Room],
};

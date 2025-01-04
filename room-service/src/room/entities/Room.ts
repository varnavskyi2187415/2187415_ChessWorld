import {
  Column, CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn, Timestamp,
} from 'typeorm';
import {Attendee} from './Attendee';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('nvarchar')
  title!: string;
  
  @Column('nvarchar')
  whiteUserId: string = '';

  @Column('nvarchar')
  blackUserId: string = '';

  @Column('longtext')
  gamePGN!: string;
  
  @Column('nvarchar')
  gameStatus: string;
  
  @Column()
  stockfishDepth?: number = -1;

  @OneToMany(() => Attendee, (attendee) => attendee.room, {onDelete: "CASCADE"})
  attendees: Attendee[];
}

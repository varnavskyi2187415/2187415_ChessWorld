import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './Room';

@Entity('attendee')
export class Attendee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('boolean')
  isPlayer: boolean = false;
  
  @Column('nvarchar', {default: ''})
  socketId: string;

  @ManyToOne(() => Room, (room) => room.attendees, {onDelete: "CASCADE"})
  room: Room;
}

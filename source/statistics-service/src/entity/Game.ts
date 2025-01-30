import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Timestamp} from "typeorm";
import { GameWhiteBlack } from "./GameWhiteBlack";

@Entity('game')
export class Game {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('timestamp', { nullable: true })
    beginning?: Timestamp;

    @Column('timestamp', { nullable: true })
    ending?: Timestamp;

    @Column('integer', { nullable: true })
    movesCount: number = 0;
}

import {Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne, JoinColumn} from "typeorm";
import {Exclude} from "class-transformer";
import {Game} from "./Game";

@Entity('game_white_black')
export class GameWhiteBlack {

    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column('uuid', { nullable: false })
    user_white_id!: number;

    @Column('uuid', { nullable: false })
    user_black_id!: number;

    @Column("json")
    @Exclude()
    user_black_moves!: string[];

    @Column("json")
    @Exclude()
    user_white_moves!: string[];

    @Column('boolean', { nullable: true })
    winner?: boolean;

    @ManyToOne(() => Game, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'gameId' })
    game!: Game;

    constructor() {
        this.user_black_moves = [];
        this.user_white_moves = [];
    }
}

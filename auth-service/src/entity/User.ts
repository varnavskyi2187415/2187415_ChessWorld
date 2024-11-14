import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty, Validate } from "class-validator";
import { IsUniqueEmail } from "../validator/IsUniqueEmail";
import { Expose, Exclude } from 'class-transformer';
import {Token} from "./Token";

@Entity('user')
@Unique('isUnique', ['email'])
export class User {

    private ROLE_USER: string = 'ROLE_USER';
    private ROLE_ADMIN: string = 'ROLE_ADMIN';

    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column("varchar", { length: 255 })
    @IsNotEmpty({ message: "Name should not be empty" })
    @Expose()
    name!: string;

    @Column("varchar", { length: 255, unique: true })
    @IsEmail()
    @IsNotEmpty({ message: "Email should not be empty" })
    @Validate(IsUniqueEmail, { message: "Email is already taken" })
    @Expose()
    email!: string;


    @Column("varchar", { length: 255 })
    @IsNotEmpty({ message: "Password should not be empty" })
    @Exclude()
    password!: string;

    @Column("json")
    @Exclude()
    roles!: string[];

    @OneToMany(() => Token, (token) => token.user)
    @Exclude()
    tokens?: Token[];

    constructor() {
        this.roles = [this.ROLE_USER];
    }
}

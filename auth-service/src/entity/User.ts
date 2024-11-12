import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty, Validate } from "class-validator";
import { IsUniqueEmail } from "../validator/IsUniqueEmail";
import { Expose, Exclude } from 'class-transformer';
import {Token} from "./Token";

@Entity('user')
@Unique('isUnique', ['_email'])
export class User {

    private ROLE_USER: string = 'ROLE_USER';
    private ROLE_ADMIN: string = 'ROLE_ADMIN';

    @PrimaryGeneratedColumn('uuid')
    private _id!: number;

    @Column("varchar", { length: 255 })
    @IsNotEmpty({ message: "Name should not be empty" })
    @Expose()
    private _name!: string;

    @Column("varchar", { length: 255, unique: true })
    @IsEmail()
    @IsNotEmpty({ message: "Email should not be empty" })
    @Validate(IsUniqueEmail, { message: "Email is already taken" })
    @Expose()
    private _email!: string;

    @Column("varchar", { length: 255 })
    @IsNotEmpty({ message: "Password should not be empty" })
    @Exclude()
    private _password!: string;

    @Column("json")
    @Exclude()
    private _roles!: string[];

    @OneToMany(() => Token, (token) => token.user)
    @Exclude()
    private _tokens?: Token[];

    constructor() {
        this.roles = [this.ROLE_USER];
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get email(): string {
        return this._email;
    }

    public set email(value: string) {
        this._email = value;
    }

    public get password(): string {
        return this._password;
    }

    public set password(value: string) {
        this._password = value;
    }

    public get roles(): string[] {
        return this._roles;
    }

    public set roles(value: string[]) {
        this._roles = value;
    }

    public get tokens(): Token[] | undefined {
        return this._tokens;
    }
}

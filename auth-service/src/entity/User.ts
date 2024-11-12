import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from "typeorm";
import { Token } from "./Token";
import {IsEmail, IsNotEmpty} from "class-validator";
import {IsUniqueEmail} from "../validator/IsUniqueEmail";

@Entity('user')
@Unique('isUnique', ['_email'])
export class User {

    protected ROLE_USER: string = 'ROLE_USER';
    protected ROLE_ADMIN: string = 'ROLE_ADMIN';

    @PrimaryGeneratedColumn('uuid')
    private _id!: number;

    @Column("varchar", { length: 255 })
    @IsNotEmpty({ message: "Name should not be empty" })
    private _name!: string;

    @Column("varchar", { length: 255, unique: true })
    @IsEmail()
    @IsNotEmpty({ message: "Email should not be empty" })
    private _email!: string;

    @Column("varchar", { length: 255 })
    @IsNotEmpty({ message: "Password should not be empty" })
    private _password!: string;

    @Column("json")
    private _roles!: string[];

    @OneToMany(() => Token, token => token.user)
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
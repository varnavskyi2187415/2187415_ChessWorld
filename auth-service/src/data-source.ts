import {DataSource} from "typeorm";
import {User} from "./entity/User";
import {Token} from "./entity/Token";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "mysql",
    port: 3306,
    username: "project-user",
    password: "123456",
    database: "project",
    synchronize: true,
    logging: true,
    entities: [User, Token],
    subscribers: [],
    migrations: [],
});
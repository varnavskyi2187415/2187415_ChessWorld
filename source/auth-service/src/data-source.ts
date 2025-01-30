import {DataSource} from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "mysql",
    port: 3306,
    username: "project-user",
    password: "123456",
    database: "project",
    synchronize: true,
    logging: true,
    entities: [__dirname + '/entity/*.ts'],
});
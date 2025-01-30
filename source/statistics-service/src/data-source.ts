import {DataSource} from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "mysql",
    port: 3306,
    username: "statistics-user",
    password: "password",
    database: "statistics-service",
    synchronize: true,
    logging: true,
    entities: [__dirname + '/entity/*.ts'],
});
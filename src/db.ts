import { DataSource } from "typeorm";
import { User } from "./entities/user";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root123",
    database: "back_end_db",
    entities: [User],
    synchronize: true,  // auto create table
});

import { DataSource } from "typeorm";
import { User } from "./entities/user";
import { Product } from "./entities/product";
import { Order } from "./entities/order";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root123",
    database: "back_end_db",
    entities: [User, Product, Order],
    synchronize: true,  // auto create table
});

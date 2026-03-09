import { DataSource } from "typeorm";
import { User } from "./entities/user";
import { Product } from "./entities/product";
import { Order } from "./entities/order";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Product, Order],
    synchronize: true,
});
import { DataSource } from "typeorm";
import { Order } from "./entities/order";
import { Product } from "./entities/product";
import { User } from "./entities/user";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_NAME || "back_end_db",
    entities: [User, Product, Order],
    synchronize: true,
});
import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import { Refund } from "./entity/Refund";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [Transaction, Refund],
    subscribers: [],
    migrations: ["./migrations/**/*.ts"]
})
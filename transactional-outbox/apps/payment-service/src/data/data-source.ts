import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import { Refund } from "./entity/Refund";
import { OutboxMessage } from "./entity/OutboxMessage";
import * as process from "node:process";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [Transaction, Refund, OutboxMessage],
    subscribers: [],
    migrations: ["./migrations/**/*.ts"]
})
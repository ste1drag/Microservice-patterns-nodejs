import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import { Refund } from "./entity/Refund";
import { OutboxMessage } from "./entity/OutboxMessage";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER ?? "steva",
    password: process.env.DB_PASSWORD ?? "stepadoo",
    database: process.env.DB_NAME ?? "paymentnode",
    synchronize: true,
    logging: true,
    entities: [Transaction, Refund, OutboxMessage],
    subscribers: [],
    migrations: ["./migrations/**/*.ts"]
})
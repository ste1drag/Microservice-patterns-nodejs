import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import { Refund } from "./entity/Refund";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "steva",
    password: "stepadoo",
    database: "payment_db",
    synchronize: false,
    logging: true,
    entities: [Transaction, Refund],
    subscribers: [],
    migrations: ["./migrations/**/*.ts"]
})
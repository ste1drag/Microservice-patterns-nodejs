import {DataSource} from "typeorm";
import {Game} from "./entity/Game";
import {GameTicket} from "./entity/GameTicket";
import {Team} from "./entity/Team";
import {Stadium} from "./entity/Stadium";
import {StadiumSeat} from "./entity/StadiumSeat";
import {OutboxMessage} from "./entity/OutboxMessage";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER ?? "steva",
    password: process.env.DB_PASSWORD ?? "stepadoo",
    database: process.env.DB_NAME ?? "gamenode",
    synchronize: false,
    migrationsRun: true,
    logging: true,
    entities: [Game, GameTicket, Team, Stadium, StadiumSeat, OutboxMessage],
    subscribers: [],
    migrations: ["./src/data/migration/**/*.ts"]
})
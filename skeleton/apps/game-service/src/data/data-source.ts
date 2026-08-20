import {DataSource} from "typeorm";
import {Game} from "./entity/Game";
import {GameTicket} from "./entity/GameTicket";
import {Team} from "./entity/Team";
import {Stadium} from "./entity/Stadium";
import {StadiumSeat} from "./entity/StadiumSeat";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [Game, GameTicket, Team, Stadium, StadiumSeat],
    subscribers: [],
    migrations: ["./src/data/migration/**/*.ts"]
})
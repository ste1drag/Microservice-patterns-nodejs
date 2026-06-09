import {DataSource} from "typeorm";
import {Game} from "./entity/Game";
import {GameTicket} from "./entity/GameTicket";
import {Team} from "./entity/Team";
import {Stadium} from "./entity/Stadium";
import {StadiumSeat} from "./entity/StadiumSeat";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "steva",
    password: "stepadoo",
    database: "gamenode",
    synchronize: false,
    logging: true,
    entities: [Game, GameTicket, Team, Stadium, StadiumSeat],
    subscribers: [],
    migrations: ["./src/data/migration/**/*.ts"]
})
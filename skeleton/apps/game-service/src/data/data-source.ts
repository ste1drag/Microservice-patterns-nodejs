import {DataSource} from "typeorm";
import {Game} from "./entity/Game";
import {GameTicket} from "./entity/GameTicket";
import {Team} from "./entity/Team";
import {Stadium} from "./entity/Stadium";
import {StadiumSeat} from "./entity/StadiumSeat";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "steva",
    password: "stepadoo",
    database: "gamee",
    synchronize: false,
    logging: true,
    entities: [Game, GameTicket, Team, Stadium, StadiumSeat],
    subscribers: [],
    migrations: ["./migrations/**/*.ts"]
})
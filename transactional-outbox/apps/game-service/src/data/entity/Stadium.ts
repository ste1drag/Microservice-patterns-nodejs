import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import "reflect-metadata";
import {Team} from "./Team";
import {Game} from "./Game";
import {StadiumSeat} from "./StadiumSeat";

@Entity()
export class Stadium {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'int'})
    home_team_id!: number;

    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'varchar', length: 255})
    city!: string;

    @Column({type: 'varchar', length: 255})
    capacity!: number;

    @OneToOne(() => Team)
    @JoinColumn({name: 'home_team_id'})
    home_team!: Team;

    @OneToMany(() => Game, game => game.game_place)
    games!: Game[];

    @OneToMany(() => StadiumSeat, seat => seat.stadium)
    seats!: StadiumSeat[];
}
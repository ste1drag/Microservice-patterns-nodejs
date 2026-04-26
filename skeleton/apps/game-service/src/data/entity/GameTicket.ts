import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./Game";
import {StadiumSeat} from "./StadiumSeat";

@Entity()
export class GameTicket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'int'})
    game_id!: number;

    @Column({type: 'int'})
    seat_id!: number;

    @Column({type: 'int'})
    price!: number;

    @Column({type: 'boolean'})
    is_sold!: boolean;

    @ManyToOne(() => Game)
    @JoinColumn({name: 'game_id'})
    game!: Game;

    @OneToOne(() => StadiumSeat)
    @JoinColumn({name: 'seat_id'})
    seat!: StadiumSeat;
}
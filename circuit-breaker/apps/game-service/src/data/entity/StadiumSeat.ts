import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Stadium} from "./Stadium";

@Entity()
export class StadiumSeat {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'int'})
    stadium_id!: number;

    @Column({type: 'int'})
    level!: number;

    @Column({type: 'int'})
    seat_number!: number;

    @ManyToOne(() => Stadium)
    @JoinColumn({name: 'stadium_id'})
    stadium!: Stadium;
}
import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Stadium} from "./Stadium";

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type:'int'})
    stadium_id!: number;

    @Column({type:'varchar', length: 255})
    name!: string;

    @Column({type:'varchar', length: 255})
    city!: string;

    @OneToOne(() => Stadium)
    @JoinColumn({name: 'stadium_id'})
    stadium!: Stadium;
}
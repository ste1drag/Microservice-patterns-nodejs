import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Stadium} from "./Stadium";

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type:'int', nullable: true})
    stadium_id!: number | null;

    @Column({type:'varchar', length: 255})
    name!: string;

    @Column({type:'varchar', length: 255})
    city!: string;

    @OneToOne(() => Stadium, { nullable: true })
    @JoinColumn({name: 'stadium_id'})
    stadium!: Stadium | null;
}
import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Team} from "./Team";
import {Stadium} from "./Stadium";
import {GameTicket} from "./GameTicket";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'integer'})
    stadium_id!: number;

    @Column({type: 'integer'})
    home_team_id!: number;

    @Column({type: 'integer'})
    away_team_id!: number;

    @Column({type: 'date'})
    date!: Date;

    @OneToOne(() => Team)
    @JoinColumn({name: 'home_team_id'})
    home_team!: Team;

    @OneToOne(() => Team)
    @JoinColumn({name: 'away_team_id'})
    away_team!: Team;

    @ManyToOne(() => Stadium)
    @JoinColumn({name: 'stadium_id'})
    game_place!: Stadium;

    @OneToMany(() => GameTicket, gameTicket => gameTicket.game)
    tickets!: GameTicket[];
}
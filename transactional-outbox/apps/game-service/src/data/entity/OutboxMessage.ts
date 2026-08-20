import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OutboxMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index({ unique: true })
    @Column({ type: "uuid" })
    message_id!: string;

    @Column({ type: "varchar" })
    type!: string;

    @Column({ type: "varchar" })
    routing_key!: string;

    @Column({ type: "text" })
    payload!: string;

    @Column({ type: "timestamp" })
    created_at!: Date;

    @Column({ type: "timestamp", nullable: true })
    processed_at?: Date | null;

    @Column({ type: "int", default: 0 })
    retry_count!: number;

    @Column({ type: "text", nullable: true })
    error?: string | null;
}

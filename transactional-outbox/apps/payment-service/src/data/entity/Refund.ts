import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RefundStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
}

@Entity()
export class Refund {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({type:"int"})
    transaction_id!: number;

    @Column({type:"decimal"})
    amount!: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @Column({ type: 'int' })
    status!: RefundStatus;
}

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

    @Column({type:"number"})
    transaction_id!: number;

    @Column({type:"decimal"})
    amount!: number;

    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;

    @Column({ type: 'int' })
    status!: RefundStatus;
}

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PaymentStatus {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Refunded = 4,
        Cancelled = 5
}

export enum PaymentCurrency {
        RSD = 1,
        USD = 2,
        EUR = 3,
        GBP = 4,
        JPY = 5,
        AUD = 6,
        CAD = 7,
        CHF = 8,
        SEK = 9,
        NZD = 10
}


@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type:"varchar"})
    user_id!: string;

    @Column({type:"decimal"})
    amount!: number;

    @CreateDateColumn({type:"timestamp"})
    created_at!: Date;

    @UpdateDateColumn({type:"timestamp"})
    updated_at!: Date;

    @Column({type: "int"})
    status!: PaymentStatus;

    @Column({type: "int"})
    currency!: PaymentCurrency;

    @Column({type:"varchar"})
    game_ticket_id!: string;
}
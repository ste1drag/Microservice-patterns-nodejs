export interface TicketSeatPayment {
    ticketId: number;
    userId: string;
    amount: number
    currency: number;
    reservationId?: number | null;
}

export interface GameSeatReq {
    gameId: number;
    seatId: number;
}

export interface PaymentRequest {
    GameTicketId: string;
    UserId: string;
    Amount: number;
    Currency: number;
    ReservationId: string;
}

export interface PaymentResult {
	transactionId?: number;
	gameTicketId: number;
	userId?: string;
	amount?: number;
	currency?: PaymentCurrency;
	status?: PaymentStatus;
	createdAt?: Date;
	message: string;
}

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

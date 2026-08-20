export interface PaymentRequestedMessage {
    reservationId: number | null;
    gameTicketId: number;
    userId: string;
    amount: number;
    currency: number;
}

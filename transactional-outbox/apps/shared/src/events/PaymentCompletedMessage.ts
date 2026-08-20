export interface PaymentCompletedMessage {
    reservationId: number | null;
    gameTicketId: number;
    transactionId: number;
    success: boolean;
    message?: string;
}

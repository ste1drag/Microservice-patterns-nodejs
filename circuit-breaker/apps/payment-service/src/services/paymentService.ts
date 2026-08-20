import { AppDataSource } from "../data/data-source";
import { PaymentStatus, PaymentCurrency, Transaction } from "../data/entity/Transaction";
import { PaymentResult } from "../interfaces/PaymentResult";
import { TicketSeatPayload } from "../interfaces/TicketSeatPayload";

const executePayment = async (ticketSeatPayload: TicketSeatPayload) : Promise<PaymentResult | null> => {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    try {
        const status = ticketSeatPayload.Amount <= 0 ? PaymentStatus.Failed : PaymentStatus.Completed;

        const transaction = transactionRepository.create({
            game_ticket_id: ticketSeatPayload.GameTicketId,
            user_id: ticketSeatPayload.UserId,
            amount: ticketSeatPayload.Amount,
            currency: ticketSeatPayload.Currency,
            status
        } as Partial<Transaction>);

        const saved = await transactionRepository.save(transaction);

        return {
            transactionId: saved.id,
            gameTicketId: saved.game_ticket_id,
            userId: saved.user_id,
            amount: saved.amount,
            currency: saved.currency,
            status: saved.status,
            createdAt: saved.created_at,
            message: "Uspesno ste izvrsili placanje"
        }
    } catch (error) {
        return null;
    }
}

export const paymentService = {
    executePayment
}
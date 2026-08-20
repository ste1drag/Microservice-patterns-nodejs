import { randomUUID } from "crypto";
import {
    MessageTypes,
    RoutingKeys,
    PaymentCompletedMessage,
    PaymentRequestedMessage,
} from "@app/contracts";
import { AppDataSource } from "../data/data-source";
import { OutboxMessage } from "../data/entity/OutboxMessage";
import { PaymentStatus, Transaction } from "../data/entity/Transaction";
import { PaymentResult } from "../interfaces/PaymentResult";

const executePayment = async (request: PaymentRequestedMessage): Promise<PaymentResult | null> => {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const status = request.amount <= 0 ? PaymentStatus.Failed : PaymentStatus.Completed;

        const transaction = queryRunner.manager.create(Transaction, {
            game_ticket_id: String(request.gameTicketId),
            user_id: request.userId,
            amount: request.amount,
            currency: request.currency,
            status,
        } as Partial<Transaction>);

        const savedTransaction = await queryRunner.manager.save(transaction);

        const paymentCompletedMessage: PaymentCompletedMessage = {
            reservationId: request.reservationId,
            gameTicketId: request.gameTicketId,
            transactionId: savedTransaction.id,
            success: status === PaymentStatus.Completed,
            message: status === PaymentStatus.Completed
                ? "Placanje izvrseno uspesno"
                : "Placanje izvrseno neuspesno",
        };

        const outboxMessage = new OutboxMessage();
        outboxMessage.message_id = randomUUID();
        outboxMessage.type = MessageTypes.PaymentCompleted;
        outboxMessage.routing_key = RoutingKeys.PaymentCompleted;
        outboxMessage.payload = JSON.stringify(paymentCompletedMessage);
        outboxMessage.created_at = new Date();

        await queryRunner.manager.save(outboxMessage);

        await queryRunner.commitTransaction();

        return {
            transactionId: savedTransaction.id,
            gameTicketId: savedTransaction.game_ticket_id,
            userId: savedTransaction.user_id,
            amount: savedTransaction.amount,
            currency: savedTransaction.currency,
            status: savedTransaction.status,
            createdAt: savedTransaction.created_at,
            message: "Uspesno ste izvrsili placanje",
        };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        return null;
    } finally {
        await queryRunner.release();
    }
}

const getTransactionInfo = async (gameTicketId: string, transactionId: string) => {
    const transactionRepository = AppDataSource.getRepository(Transaction);

    try {
        const transactionInfo = await transactionRepository.findOne({
            where:{
                game_ticket_id: gameTicketId,
                id: parseInt(transactionId)
            }
        });

        if(!transactionInfo)
            return null;

        return transactionInfo;
    } catch (error){
        return null;
    }
}

export const paymentService = {
    executePayment,
    getTransactionInfo
}
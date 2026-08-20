import { Channel, ConsumeMessage } from "amqplib";
import { PaymentCompletedMessage, Queues } from "@app/contracts";
import { gameService } from "../../services/gameService";

export const registerPaymentCompletedConsumer = (channel: Channel) => {
    channel.consume(Queues.PaymentCompleted, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const event = JSON.parse(msg.content.toString()) as PaymentCompletedMessage;

            if (event.success) {
                await gameService.confirmTicket(event.gameTicketId);
            } else {
                await gameService.releaseTicket(event.gameTicketId);
            }

            channel.ack(msg);
        } catch (err) {
            console.error("Failed to process payment-completed message:", err);
            channel.nack(msg, false, false);
        }
    });
};

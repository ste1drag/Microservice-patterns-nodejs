import { Channel, ConsumeMessage } from "amqplib";
import { PaymentRequestedMessage, Queues } from "@app/contracts";
import { paymentService } from "../../services/paymentService";

export const registerPaymentRequestedConsumer = (channel: Channel) => {
    channel.consume(Queues.PaymentRequested, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const event = JSON.parse(msg.content.toString()) as PaymentRequestedMessage;

            const result = await paymentService.executePayment(event);

            if (!result) {
                throw new Error("Payment execution failed");
            }

            channel.ack(msg);
        } catch (err) {
            console.error("Failed to process payment-requested message:", err);
            channel.nack(msg, false, false);
        }
    });
};

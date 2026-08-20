export const EXCHANGE = "outbox.exchange";
export const EXCHANGE_TYPE = "direct";

export const DEAD_LETTER_EXCHANGE = "outbox.dlx";
export const DEAD_LETTER_QUEUE = "outbox.dlq";
export const DEAD_LETTER_ROUTING_KEY = "outbox.dead-letter";

export const RoutingKeys = {
    PaymentRequested: "payment.requested",
    PaymentCompleted: "payment.completed",
} as const;

export const Queues = {
    PaymentRequested: "payment-requested",
    PaymentCompleted: "payment-completed",
} as const;

export const MessageTypes = {
    PaymentRequested: "PaymentRequested",
    PaymentCompleted: "PaymentCompleted",
} as const;

export type RoutingKey = (typeof RoutingKeys)[keyof typeof RoutingKeys];
export type QueueName = (typeof Queues)[keyof typeof Queues];
export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];

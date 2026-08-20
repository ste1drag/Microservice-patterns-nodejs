import amqp from "amqplib";
import {
    EXCHANGE,
    EXCHANGE_TYPE,
    DEAD_LETTER_EXCHANGE,
    DEAD_LETTER_QUEUE,
    DEAD_LETTER_ROUTING_KEY,
} from "@app/contracts";

type Connection = Awaited<ReturnType<typeof amqp.connect>>;
type Chan = Awaited<ReturnType<Connection["createChannel"]>>;

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";
const RECONNECT_DELAY_MS = 5000;

export interface ConsumerBinding {
    queue: string;
    routingKey: string;
}

let connection: Connection | null = null;
let channel: Chan | null = null;
let binding: ConsumerBinding | null = null;
let onReady: ((channel: Chan) => Promise<void> | void) | undefined;
let closing = false;

const assertTopology = async (ch: Chan, consumer: ConsumerBinding) => {
    await ch.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });

    await ch.assertExchange(DEAD_LETTER_EXCHANGE, "direct", { durable: true });
    await ch.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    await ch.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, DEAD_LETTER_ROUTING_KEY);

    await ch.assertQueue(consumer.queue, {
        durable: true,
        deadLetterExchange: DEAD_LETTER_EXCHANGE,
        deadLetterRoutingKey: DEAD_LETTER_ROUTING_KEY,
    });
    await ch.bindQueue(consumer.queue, EXCHANGE, consumer.routingKey);

    await ch.prefetch(10);
};

const establish = async () => {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await assertTopology(channel, binding!);

    connection.on("error", (err) => console.error("RabbitMQ konekcija greska:", err.message));
    connection.on("close", () => {
        if (closing) return;
        console.warn(`RabbitMQ connectija zatvorena, reconnecting in ${RECONNECT_DELAY_MS}ms`);
        channel = null;
        connection = null;
        setTimeout(() => {
            establish().catch((err) => console.error("RabbitMQ reconnect failed:", err.message));
        }, RECONNECT_DELAY_MS);
    });

    if (onReady) await onReady(channel);

    console.log("RabbitMQ connected and topology asserted");
};

export const connectRabbitMq = async (
    consumer: ConsumerBinding,
    ready?: (channel: Chan) => Promise<void> | void,
    retries = 10,
): Promise<Chan> => {
    binding = consumer;
    onReady = ready;
    closing = false;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await establish();
            return channel!;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`RabbitMQ connect attempt ${attempt}/${retries} failed: ${message}`);
            if (attempt === retries) throw err;
            await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
        }
    }

    throw new Error("Unable to connect to RabbitMQ");
};

export const getChannel = (): Chan => {
    if (!channel) {
        throw new Error("RabbitMQ channel not initialized. Call connectRabbitMq() first.");
    }
    return channel;
};

export const closeRabbitMq = async () => {
    closing = true;
    try {
        await channel?.close();
        await connection?.close();
    } catch (err) {
        console.error("Error closing RabbitMQ:", err);
    } finally {
        channel = null;
        connection = null;
    }
};

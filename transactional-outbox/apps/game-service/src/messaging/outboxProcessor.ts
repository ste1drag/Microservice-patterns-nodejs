import { DataSource } from "typeorm";
import { OutboxMessage } from "../data/entity/OutboxMessage";
import { publishMessage } from "./publisher/publishMessage";

const BATCH_SIZE = 10;

export const processOutbox = async (dataSource: DataSource): Promise<void> => {
    await dataSource.transaction(async (manager) => {
        const messages = await manager
            .getRepository(OutboxMessage)
            .createQueryBuilder("message")
            .setLock("pessimistic_write")
            .setOnLocked("skip_locked")
            .where("message.processed_at IS NULL")
            .orderBy("message.created_at", "ASC")
            .take(BATCH_SIZE)
            .getMany();

        for (const message of messages) {
            try {
                await publishMessage(message.routing_key, message.payload, {
                    messageId: message.message_id,
                    type: message.type,
                });

                message.processed_at = new Date();
                message.error = null;
                await manager.save(message);
            } catch (err) {
                message.retry_count += 1;
                message.error = err instanceof Error ? err.message : String(err);
                await manager.save(message);
                console.error(`Failed to publish outbox message ${message.message_id}:`, message.error);
            }
        }
    });
};

export const startOutboxProcessor = (dataSource: DataSource, intervalMs = 2000): NodeJS.Timeout => {
    let running = false;

    return setInterval(async () => {
        if (running) return;
        running = true;
        try {
            await processOutbox(dataSource);
        } catch (err) {
            console.error("Outbox processor run failed:", err);
        } finally {
            running = false;
        }
    }, intervalMs);
};

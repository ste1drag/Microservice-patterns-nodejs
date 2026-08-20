import { EXCHANGE } from "@app/contracts";
import { getChannel } from "../connection";

export interface PublishOptions {
    messageId?: string;
    type?: string;
}

export const publishMessage = async (
    routingKey: string,
    payload: string,
    options: PublishOptions = {},
): Promise<void> => {
    const channel = getChannel();

    const ok = channel.publish(EXCHANGE, routingKey, Buffer.from(payload), {
        persistent: true,
        contentType: "application/json",
        messageId: options.messageId,
        type: options.type,
    });

    if (!ok) {
        await new Promise<void>((resolve) => channel.once("drain", () => resolve()));
    }
};

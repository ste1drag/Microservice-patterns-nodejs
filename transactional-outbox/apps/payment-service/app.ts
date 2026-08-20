import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import { Queues, RoutingKeys } from "@app/contracts";
import { initializeDatabase } from "./src/data";
import { AppDataSource } from "./src/data/data-source";
import { paymentRouter } from "./src/routes/payment";
import { connectRabbitMq, closeRabbitMq } from "./src/messaging/connection";
import { registerPaymentRequestedConsumer } from "./src/messaging/consumer/payloadMessage";
import { startOutboxProcessor } from "./src/messaging/outboxProcessor";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const GAME_SERVICE_ORIGIN = process.env.GAME_SERVICE_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: GAME_SERVICE_ORIGIN }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Payment service is running");
});

app.use("/payment", paymentRouter);

const start = async () => {
    try {
        await initializeDatabase();

        await connectRabbitMq(
            { queue: Queues.PaymentRequested, routingKey: RoutingKeys.PaymentRequested },
            (channel) => registerPaymentRequestedConsumer(channel),
        );

        const outboxTimer = startOutboxProcessor(AppDataSource);

        const shutdown = async () => {
            clearInterval(outboxTimer);
            await closeRabbitMq();
            await AppDataSource.destroy();
            process.exit(0);
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

        app.listen(PORT, () => {
            console.log(`Payment service is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start payment service:", error);
        process.exit(1);
    }
};

start();

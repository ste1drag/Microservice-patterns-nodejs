import "reflect-metadata";
import express, { Request, Response } from "express";
import { Queues, RoutingKeys } from "@app/contracts";
import { initializeDatabase } from "./src/data";
import { AppDataSource } from "./src/data/data-source";
import { gameRouter } from "./src/routes/game";
import { seedDemoData } from "./src/data/seed";
import { connectRabbitMq, closeRabbitMq } from "./src/messaging/connection";
import { registerPaymentCompletedConsumer } from "./src/messaging/consumer/paymentCompletedConsumer";
import { startOutboxProcessor } from "./src/messaging/outboxProcessor";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Game service is running");
});

app.use("/game", gameRouter);

const start = async () => {
    try {
        await initializeDatabase();
        try {
            await seedDemoData();
        } catch (seedError) {
            console.warn("Game demo seed skipped:", seedError);
        }

        await connectRabbitMq(
            { queue: Queues.PaymentCompleted, routingKey: RoutingKeys.PaymentCompleted },
            (channel) => registerPaymentCompletedConsumer(channel),
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
            console.log(`Game service is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start game service:", error);
        process.exit(1);
    }
};

start();

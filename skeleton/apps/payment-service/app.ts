import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import { initializeDatabase } from "./src/data";
import { paymentRouter } from "./src/routes/payment";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const GAME_SERVICE_ORIGIN = process.env.GAME_SERVICE_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: GAME_SERVICE_ORIGIN }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Payment service is running");
});

app.use("/", paymentRouter);

const start = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`Payment service is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start payment service:", error);
        process.exit(1);
    }
};

start();

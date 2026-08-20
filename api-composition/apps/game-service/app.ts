import "reflect-metadata";
import express, { Request, Response } from "express";
import { initializeDatabase } from "./src/data";
import { gameRouter } from "./src/routes/game";
import { seedDemoData } from "./src/data/seed";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Game service is running");
});

app.use("/", gameRouter);

const start = async () => {
    try {
        await initializeDatabase();
        try {
            await seedDemoData();
        } catch (seedError) {
            console.warn("Game demo seed skipped:", seedError);
        }
        app.listen(PORT, () => {
            console.log(`Game service is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start game service:", error);
        process.exit(1);
    }
};

start();

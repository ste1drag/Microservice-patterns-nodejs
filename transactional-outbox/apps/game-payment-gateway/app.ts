import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { NextFunction } from "express";
import axios from "axios";

const app = express();

app.use(
    "/game",
    createProxyMiddleware({
        target:"http://localhost:3000",
        changeOrigin: true,
        pathRewrite: {
            "^/game": "/"
        }
    })
);

app.use(
    "/payment",
    createProxyMiddleware({
        target:"http://localhost:3001",
        changeOrigin: true,
        pathRewrite: {
            "^/payment": "/"
        }
    })
);

app.get("/get-transaction-info/:gameTicketId/:transactionId", async (req: Request, res: Response, next: NextFunction) => {
    const gameClient = axios.create({baseURL: "http://localhost:3000"});
    const paymentClient = axios.create({baseURL: "http://localhost:3001"});

    const { gameTicketId, transactionId } = req.params;

    try{
        const [gameTicketInfo, transactionInfo] = await Promise.all([gameClient.get<any>(`/get-ticket-info/${gameTicketId}`), paymentClient.get<any>(`/transaction-info/gameTicket/${gameTicketId}/transaction/${transactionId}`)]);

        return res.status(200).json({
            gameTicketInfo: gameTicketInfo.data,
            transactionInfo: transactionInfo.data
        });
    } catch (err) {
        return res.status(500).json({message:"Interna greska"});
    }
});

app.listen(3002, () => {
    console.log("Server running on port 3002");
});
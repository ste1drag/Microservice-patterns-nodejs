import { Request, Response, NextFunction } from "express";
import { PaymentRequestedMessage } from "@app/contracts";
import { paymentService } from "../services/paymentService";

const executePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body ?? {};

        if (
            body.gameTicketId === undefined ||
            !body.userId ||
            body.amount === undefined ||
            body.currency === undefined
        ) {
            return res.status(400).json({ message: "Missing or invalid payment request" });
        }

        const request: PaymentRequestedMessage = {
            reservationId: body.reservationId ?? null,
            gameTicketId: Number(body.gameTicketId),
            userId: String(body.userId),
            amount: Number(body.amount),
            currency: Number(body.currency),
        };

        const result = await paymentService.executePayment(request);

        if (!result) return res.status(400).json({ message: "Payment failed" });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

const getTransactionInfo = async (req:Request, res: Response, next: NextFunction) => {
    const gameTicketId = req.params.gameTicketId as string;
    const transactionId = req.params.transactionId as string;

    if(!gameTicketId || !transactionId)
        return res.status(400).json({ message: "Nisu uneti parametri" });

    const transactionInfo = await paymentService.getTransactionInfo(gameTicketId, transactionId);

    if(!transactionInfo)
        return res.status(400).json({ message: "Nije pronadjena transakcija" });

    return res.status(200).json(transactionInfo);
}

export const paymentController = {
    executePayment,
    getTransactionInfo
};

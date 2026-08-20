import { Request, Response, NextFunction } from "express";
import { TicketSeatPayload } from "../interfaces/TicketSeatPayload";
import { paymentService } from "../services/paymentService";

const executePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticketSeatPayload = req.body as TicketSeatPayload;

        if (
            !ticketSeatPayload ||
            !ticketSeatPayload.GameTicketId ||
            !ticketSeatPayload.UserId ||
            ticketSeatPayload.Amount === undefined ||
            ticketSeatPayload.Currency === undefined
        ) {
            return res.status(400).json({ message: "Missing or invalid ticketSeatPayload" });
        }

        const result = await paymentService.executePayment(ticketSeatPayload);

        if (!result) return res.status(400).json({ message: "Payment failed" });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const paymentController = {
    executePayment,
};

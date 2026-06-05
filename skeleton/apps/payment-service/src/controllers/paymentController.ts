import { Request, Response, NextFunction } from "express";
import { TicketSeatPayload } from "../interfaces/TicketSeatPayload";
import { paymentService } from "../services/paymentService";

const executePayment =  async (req: Request, res: Response, next: NextFunction) => {
    try {
        const raw = req.query.ticketSeatPayload;

        let ticketSeatPayload: TicketSeatPayload;

        if (typeof raw === 'string') {
            ticketSeatPayload = JSON.parse(raw) as TicketSeatPayload;
        } else if (raw && typeof raw === 'object') {
            // ParsedQs or object - cast via unknown to satisfy TS
            ticketSeatPayload = raw as unknown as TicketSeatPayload;
        } else {
            return res.status(400).json({ message: 'Missing or invalid ticketSeatPayload' });
        }

        const result = await paymentService.executePayment(ticketSeatPayload);

        if (!result) return res.status(400).json({ message: 'Payment failed' });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}



export const paymentController = {
    executePayment
}
import express from "express";
import { paymentController } from "../controllers/paymentController";

const router = express.Router();

router.post("/ticketpay", paymentController.executePayment);
router.get("/transaction-info/gameTicket/:gameTicketId/transaction/:transactionId", paymentController.getTransactionInfo);

export const paymentRouter = router;

import express from "express";
import { paymentController } from "../controllers/paymentController";

const router = express.Router();

router.post("/ticketpay", paymentController.executePayment);

export const paymentRouter = router;

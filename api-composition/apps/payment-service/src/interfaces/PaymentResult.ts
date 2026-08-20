import { PaymentCurrency, PaymentStatus } from "../data/entity/Transaction";

export interface PaymentResult {
	transactionId: number;
	gameTicketId: string;
	userId: string;
	amount: number;
	currency: PaymentCurrency;
	status: PaymentStatus;
	createdAt: Date;
	message: string;
}
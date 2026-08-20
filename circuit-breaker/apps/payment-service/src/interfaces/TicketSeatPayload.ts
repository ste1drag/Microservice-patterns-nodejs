import { PaymentCurrency } from "../data/entity/Transaction";

export interface TicketSeatPayload {
  GameTicketId: string;
  UserId: string;
  Amount: number;
  Currency: PaymentCurrency;
  ReservationId: string;
}

import express from "express";
import {gameController} from "../controllers/gameController";

const router = express.Router();

router.get("/get-all-games", gameController.getAllGames);
router.get("/get-game/:id", gameController.getGame);
router.get("/get-game-tickets/:gameId", gameController.getGameTickets);
router.get("/get-seat-info/game/:gameId/seat/:seatId", gameController.getSeatInfo);
router.get("/get-ticket-info/:gameTicketId", gameController.getGameTicketInfo);
router.post("/ticketpay", gameController.postTicketPay);

export const gameRouter = router;
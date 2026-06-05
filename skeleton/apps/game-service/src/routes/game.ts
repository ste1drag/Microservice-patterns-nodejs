import express from "express";
import {gameController} from "../controllers/gameController";

const router = express.Router();

router.get("/get-all-games", gameController.getAllGames);
router.get("/get-game/:id", gameController.getGame);
router.get("/get-seat-info", gameController.getSeatInfo);
router.post("/ticketpay", gameController.postTicketPay);

export const gameRouter = router;
import {Request, Response, NextFunction} from "express";
import {gameService} from "../services/gameService";
import {GameInfo} from "../interfaces/Game";
import {GameSeat} from "../interfaces/GameSeat";

const getAllGames = async (req: Request, res: Response, next: NextFunction) => {
    const games: GameInfo[] | null = await gameService.getAllGames();

    if (!games || !games.length) {
        res.status(404).send("Nema trenutno nijedna igra");
    }

    res.status(200).send(games);
}

const getGame = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;

    if (!id)
        return res.status(404).send("Nema id");

    const game: GameInfo | null = await gameService.getGameById(parseInt(id as string));

    if (!game)
        res.status(404).send("Utakmica nije pronadjena");

    res.status(200).send(game);
}

const getSeatInfo = async (req: Request, res: Response, next: NextFunction) => {
    const gameId = req.query.gameId as string;
    const seatId = req.query.seatId as string;

    if (!gameId || !seatId) {
        res.status(404).send("Nisu svi podaci poslati");
    }

    const gameSeat: GameSeat | null = await gameService.getSeatInfo(parseInt(gameId), parseInt(seatId));

    if (!gameSeat)
        res.status(404).send("Nije pronadjeno sediste");

    res.status(200).send(gameSeat);
}

const postTicketPay = async (req: Request, res: Response, next: NextFunction) => {
    const gameId = req.query.gameId as string;
    const seatId = req.query.seatId as string;
    const priceStr = req.query.price as string;

    const price = parseInt(price);

    if (!gameId || !seatId) {
        res.status(404).send("Nisu svi podaci poslati");
    }

    const result = await gameService.postTicketPayment({gameId: parseInt(gameId), seatId: parseInt(seatId), price});

    if (!result){
        res.status(404).send("Nisu svi podaci poslati");
    }

    res.status(200).send(result);
}



export const gameController = {
    getAllGames,
    getGame,
    getSeatInfo,
    postTicketPay,
}
import {Request, Response, NextFunction} from "express";
import {gameService} from "../services/gameService";
import {GameInfo} from "../interfaces/Game";
import {GameSeat} from "../interfaces/GameSeat";

const getAllGames = async (req: Request, res: Response, next: NextFunction) => {
    const games: GameInfo[] | null = await gameService.getAllGames();

    if (!games || !games.length) {
        return res.status(404).send("Nema trenutno nijedna igra");
    }

    return res.status(200).send(games);
}

const getGame = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id)
        return res.status(400).send("Nema id");

    const parsedId = Number(id);

    if (Number.isNaN(parsedId)) {
        return res.status(400).send("Id nije u dobrom formatu");
    }

    const game: GameInfo | null = await gameService.getGameById(parsedId);

    if (!game)
        return res.status(404).send("Utakmica nije pronadjena");

    return res.status(200).send(game);
}

const getSeatInfo = async (req: Request, res: Response, next: NextFunction) => {
    const gameId = req.params.gameId as string;
    const seatId = req.params.seatId as string;

    if (!gameId || !seatId) {
        return res.status(400).send("Nisu svi podaci poslati");
    }

    const gameSeat: GameSeat | null = await gameService.getSeatInfo(parseInt(gameId), parseInt(seatId));

    if (!gameSeat)
        return res.status(404).send("Nije pronadjeno sediste");

    return res.status(200).send(gameSeat);
}

const getGameTickets = async (req: Request, res: Response, next: NextFunction) => {
    const gameId = req.params.gameId as string;

    if(!gameId)
        return res.status(404).send("Nije pronadjena utakmica");

    const gameTickets = await gameService.getGameTickets(parseInt(gameId));

    return res.status(200).json(gameTickets);
}

const postTicketPay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {ticketId, userId, amount, currency, reservationId} = req.body ?? {};

        if (!ticketId || !userId || !amount || currency === undefined) {
            return res.status(400).send("Nisu svi podaci poslati");
        }


        const result = await gameService.postTicketPayment({
            ticketId: parseInt(ticketId),
            userId,
            amount: parseInt(amount),
            currency: parseInt(currency),
            reservationId: reservationId ? parseInt(reservationId) : null
        });

        if (!result) {
            return res.status(404).send("Karta nije pronadjena");
        }

        return res.status(200).send(result);
    } catch (err) {
        return next(err);
    }
}

const getGameTicketInfo = async (req: Request, res: Response, next: NextFunction) => {
    const gameTicketId = req.params.gameTicketId as string;

    if(!gameTicketId)
        return res.status(400).send({message: "Parametar nije ispravan"});

    try{
        const gameTicketInfo = await gameService.getTicketInfo(gameTicketId);

        if(!gameTicketInfo)
            return res.status(400).send({message: "Karta nije pronadjena"});

        return res.status(200).json(gameTicketInfo);
    }
    catch(error) {
        return res.status(500).send({message: "Interna greska servera"});
    }
}

export const gameController = {
    getAllGames,
    getGame,
    getSeatInfo,
    postTicketPay,
    getGameTickets,
    getGameTicketInfo
}

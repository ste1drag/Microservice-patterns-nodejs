import {TicketSeatPayment} from "../interfaces/TicketSeatPayment";
import {GameInfo} from "../interfaces/Game";
import {GameSeat} from "../interfaces/GameSeat";
import {AppDataSource} from "../data/data-source";
import {Game} from "../data/entity/Game";
import {GameTicket} from "../data/entity/GameTicket";
import axios from "axios";

const getAllGames = async (): Promise<GameInfo[] | null> => {
    const gameRepository = AppDataSource.getRepository(Game);

    const games = await gameRepository.find(
        {
            relations: {
                home_team: true,
                away_team: true,
            }
        }
    );

    if(!games.length) {
        return null;
    }

    const gamesInfo: GameInfo[] = games.map((game) => (
         {
            id: game.id,
            homeTeamName: game.home_team.name,
            awayTeamName: game.away_team.name,
            stadiumName: game.game_place.name,
            date: game.date
        }
    ));

    return gamesInfo;
}

const getGameById = async (gameId: number): Promise<GameInfo | null> => {
    const gameRepository = AppDataSource.getRepository(Game);

    const game = await gameRepository.findOne({
        where: {
            id: gameId,
        },
        relations: {
            home_team: true,
            away_team: true
        }
    });

    if (!game)
        return null;

    const gameInfo: GameInfo = {
        id: game.id,
        homeTeamName: game.home_team.name,
        awayTeamName: game.away_team.name,
        stadiumName: game.game_place.name,
        date: game.date
    };

    return gameInfo;
}

const getSeatInfo = async (gameId: number, seatId: number): Promise<GameSeat | null> => {
    const gameSeatRepository = AppDataSource.getRepository(GameTicket);

    const gameSeat = await gameSeatRepository.findOne({
        where: {
            game_id: gameId,
            seat_id: seatId,
        }
    });

    if (!gameSeat)
        return null;

    const gameSeatInfo: GameSeat = {
        gameId,
        seatId,
        status: gameSeat.status,
        price: gameSeat.price,
        message: "Karta dostupna za kupovinu",
        level: gameSeat.seat.level,
        seatNumber: gameSeat.seat.seat_number
    }

    return gameSeatInfo;
}

const postTicketPayment = async (ticketSeatPayment: TicketSeatPayment): Promise<string> => {
    const baseUrl = axios.create({
        baseURL: "https://api.ticketpay.com/v1/",
    });

    const responseData = await baseUrl.post("/ticketpay", ticketSeatPayment);

    return responseData.data.status;
}

const confirmPayment = async (ticketSeatPayment: TicketSeatPayment): Promise<string> => {
    const baseUrl = axios.create({
        baseURL: "https://api.ticketpay.com/v1/",
    });

    const responseData = await baseUrl.post("/confirm-payment", ticketSeatPayment);

    return responseData.data.status;
}

export const gameService = {
    getAllGames,
    getGameById,
    getSeatInfo,
    postTicketPayment,
    confirmPayment,
}
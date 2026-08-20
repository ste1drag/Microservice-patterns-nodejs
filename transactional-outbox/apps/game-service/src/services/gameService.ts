import {PaymentRequest, PaymentResult, PaymentStatus, TicketSeatPayment} from "../interfaces/TicketSeatPayment";
import {GameInfo} from "../interfaces/Game";
import {GameSeat} from "../interfaces/GameSeat";
import {AppDataSource} from "../data/data-source";
import {Game} from "../data/entity/Game";
import {GameTicket} from "../data/entity/GameTicket";
import {TicketStatus} from "../data/enums/TicketStatus";
import axios from "axios";
import { randomUUID } from "crypto";
import { MessageTypes, RoutingKeys, PaymentRequestedMessage } from "@app/contracts";
import CircuitBreaker from "../utils/circuitBreaker";
import { OutboxMessage } from "../data/entity/OutboxMessage";

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL ?? "http://localhost:3001";
const PAYMENT_TIMEOUT_MS = 5000;

const paymentCircuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    recoveryTimeout: 30000,
    successThreshold: 2,
    callTimeout: PAYMENT_TIMEOUT_MS,
});

const getAllGames = async (): Promise<GameInfo[] | null> => {
    const gameRepository = AppDataSource.getRepository(Game);

    const games = await gameRepository.find(
        {
            relations: {
                home_team: true,
                away_team: true,
                game_place: true,
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
            away_team: true,
            game_place: true,
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
        },
        relations: {
            seat: true,
        },
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

const tryReserveTicket = async (ticketId: number, reservationId: number): Promise<boolean> => {
    const gameTicketRepository = AppDataSource.getRepository(GameTicket);

    const result = await gameTicketRepository.update(
        {id: ticketId, status: TicketStatus.AVAILABLE},
        {
            status: TicketStatus.PENDING,
            reservation_id: reservationId,
            reserved_at: new Date(),
        }
    );

    return result.affected === 1;
}

const confirmTicket = async (ticketId: number): Promise<boolean> => {
    const gameTicketRepository = AppDataSource.getRepository(GameTicket);

    const result = await gameTicketRepository.update(
        {id: ticketId, status: TicketStatus.PENDING},
        {status: TicketStatus.SOLD}
    );

    return result.affected === 1;
}

const releaseTicket = async (ticketId: number): Promise<boolean> => {
    const gameTicketRepository = AppDataSource.getRepository(GameTicket);

    const result = await gameTicketRepository.update(
        {id: ticketId, status: TicketStatus.PENDING},
        {
            status: TicketStatus.AVAILABLE,
            reservation_id: null,
            reserved_at: null,
        }
    );

    return result.affected === 1;
}

const releaseReservedTicket = async (ticketId: number): Promise<void> => {
    try {
        const released = await releaseTicket(ticketId);

        if (!released) {
            console.warn(`Reserved ticket ${ticketId} was not released because it is no longer pending`);
        }
    } catch (releaseError) {
        console.error(`Failed to release reserved ticket ${ticketId}:`, releaseError);
    }
}

const tryTicketPay = async (paymentRequest: PaymentRequest): Promise<PaymentResult> => {
    const client = axios.create({
            baseURL: PAYMENT_SERVICE_URL,
            timeout: PAYMENT_TIMEOUT_MS,
        });

    const response = await paymentCircuitBreaker.call(() =>
        client.post<PaymentResult>("/ticketpay", paymentRequest)
    );

    return response.data;
}

const postTicketPayment = async (ticketSeatPayment: TicketSeatPayment): Promise<PaymentResult | null> => {
    const queryRunner = AppDataSource.createQueryRunner();
    const gameTicketRepository = AppDataSource.getRepository(GameTicket);
    const outboxRepository = AppDataSource.getRepository(OutboxMessage);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const transactionalGameTicketRepository = queryRunner.manager.withRepository(gameTicketRepository);
        const transactionalOutboxRepository = queryRunner.manager.withRepository(outboxRepository);

        const updated = await transactionalGameTicketRepository.update(
            {id: ticketSeatPayment.ticketId, status: TicketStatus.AVAILABLE},
            {status: TicketStatus.PENDING, reserved_at: new Date(Date.now()), reservation_id: ticketSeatPayment.reservationId}
        );

        if(updated.affected === 0) {
            await queryRunner.rollbackTransaction();

            return {
                gameTicketId: ticketSeatPayment.ticketId,
                status: PaymentStatus.Failed,
                message: "Karta nije dostupna"
            };
        }

        const paymentRequestedMessage: PaymentRequestedMessage = {
            reservationId: ticketSeatPayment.reservationId ?? null,
            gameTicketId: ticketSeatPayment.ticketId,
            userId: ticketSeatPayment.userId,
            amount: ticketSeatPayment.amount,
            currency: ticketSeatPayment.currency,
        };

        const outboxMessage = new OutboxMessage();
        outboxMessage.message_id = randomUUID();
        outboxMessage.type = MessageTypes.PaymentRequested;
        outboxMessage.routing_key = RoutingKeys.PaymentRequested;
        outboxMessage.payload = JSON.stringify(paymentRequestedMessage);
        outboxMessage.created_at = new Date();

        await transactionalOutboxRepository.save(outboxMessage);
        await queryRunner.commitTransaction();

        return {
            gameTicketId: ticketSeatPayment.ticketId,
            status: PaymentStatus.Pending,
            message: "Rezervacija uspesna, cekanje na placanje",
            userId: ticketSeatPayment.userId,
            currency: ticketSeatPayment.currency,
            amount: ticketSeatPayment.amount
        }
    } catch (error){
        await queryRunner.rollbackTransaction();

        return {
            gameTicketId: ticketSeatPayment.ticketId,
            status: PaymentStatus.Failed,
            message: "Karta nije dostupna"
        }
    }
}

const getGameTickets = async (gameId: number): Promise<GameTicket[]> => {
    const gameTicketRepository = AppDataSource.getRepository(GameTicket);

    const gameTickets = await gameTicketRepository.find({
        where:{
            game_id: gameId
        }
    });

    return gameTickets;
}

const getTicketInfo = async (gameTicketId: string): Promise<GameTicket | null> => {
    const gameTicketRepository = AppDataSource.getRepository(GameTicket);

    try {
        const gameTicketInfo = await gameTicketRepository.findOne({
            where:{
                id: parseInt(gameTicketId)
            }
        });

        if(!gameTicketInfo)
            return null;

        return gameTicketInfo;
    } catch (error) {
        throw error;
    }
}

export const gameService = {
    getAllGames,
    getGameById,
    getSeatInfo,
    postTicketPayment,
    tryReserveTicket,
    confirmTicket,
    releaseTicket,
    getGameTickets,
    getTicketInfo
}

import { AppDataSource } from "./data-source";
import { Team } from "./entity/Team";
import { Stadium } from "./entity/Stadium";
import { StadiumSeat } from "./entity/StadiumSeat";
import { Game } from "./entity/Game";
import { GameTicket } from "./entity/GameTicket";
import { TicketStatus } from "./enums/TicketStatus";

const hasRequiredTables = async (): Promise<boolean> => {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        const requiredTables = ["team", "stadium", "stadium_seat", "game", "game_ticket"];

        for (const tableName of requiredTables) {
            const exists = await queryRunner.hasTable(tableName);

            if (!exists) {
                return false;
            }
        }

        return true;
    } finally {
        await queryRunner.release();
    }
};

const ensureTeam = async (name: string, city: string, stadiumId: number | null): Promise<Team> => {
    const teamRepository = AppDataSource.getRepository(Team);
    const existing = await teamRepository.findOne({ where: { name } });

    if (existing) {
        if (existing.stadium_id !== stadiumId) {
            existing.stadium_id = stadiumId;
            return teamRepository.save(existing);
        }

        return existing;
    }

    const created = teamRepository.create({
        name,
        city,
        stadium_id: stadiumId,
    });

    return teamRepository.save(created);
};

const ensureStadium = async (name: string, city: string, capacity: number, homeTeamId: number): Promise<Stadium> => {
    const stadiumRepository = AppDataSource.getRepository(Stadium);
    const existing = await stadiumRepository.findOne({ where: { name } });

    if (existing) {
        let changed = false;

        if (existing.home_team_id !== homeTeamId) {
            existing.home_team_id = homeTeamId;
            changed = true;
        }

        if (existing.capacity !== capacity) {
            existing.capacity = capacity;
            changed = true;
        }

        if (existing.city !== city) {
            existing.city = city;
            changed = true;
        }

        return changed ? stadiumRepository.save(existing) : existing;
    }

    const created = stadiumRepository.create({
        name,
        city,
        capacity,
        home_team_id: homeTeamId,
    });

    return stadiumRepository.save(created);
};

const ensureSeats = async (stadiumId: number): Promise<StadiumSeat[]> => {
    const seatRepository = AppDataSource.getRepository(StadiumSeat);
    const existingSeats = await seatRepository.find({
        where: {
            stadium_id: stadiumId,
        },
    });

    if (existingSeats.length >= 10) {
        return existingSeats;
    }

    const seatMap = new Map<number, StadiumSeat>();
    for (const seat of existingSeats) {
        seatMap.set(seat.seat_number, seat);
    }

    for (let seatNumber = 1; seatNumber <= 10; seatNumber += 1) {
        if (!seatMap.has(seatNumber)) {
            const createdSeat = seatRepository.create({
                stadium_id: stadiumId,
                level: seatNumber <= 4 ? 1 : 2,
                seat_number: seatNumber,
            });

            const savedSeat = await seatRepository.save(createdSeat);
            seatMap.set(savedSeat.seat_number, savedSeat);
        }
    }

    return Array.from(seatMap.values());
};

const ensureGame = async (stadiumId: number, homeTeamId: number, awayTeamId: number): Promise<Game> => {
    const gameRepository = AppDataSource.getRepository(Game);
    const existing = await gameRepository.findOne({
        where: {
            stadium_id: stadiumId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
        },
    });

    if (existing) {
        return existing;
    }

    const gameDate = new Date();
    gameDate.setDate(gameDate.getDate() + 7);

    const created = gameRepository.create({
        stadium_id: stadiumId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        date: gameDate,
    });

    return gameRepository.save(created);
};

const ensureTickets = async (gameId: number, seats: StadiumSeat[]): Promise<void> => {
    const ticketRepository = AppDataSource.getRepository(GameTicket);
    const selectedSeats = seats
        .sort((a, b) => a.seat_number - b.seat_number)
        .slice(0, 6);

    for (const seat of selectedSeats) {
        const existing = await ticketRepository.findOne({
            where: {
                game_id: gameId,
                seat_id: seat.id,
            },
        });

        if (existing) {
            continue;
        }

        const created = ticketRepository.create({
            game_id: gameId,
            seat_id: seat.id,
            price: seat.level === 1 ? 5000 : 3000,
            status: TicketStatus.AVAILABLE,
            reservation_id: null,
            reserved_at: null,
        });

        await ticketRepository.save(created);
    }
};

export const seedDemoData = async (): Promise<void> => {
    const canSeed = await hasRequiredTables();

    if (!canSeed) {
        return;
    }

    const gameRepository = AppDataSource.getRepository(Game);
    const ticketRepository = AppDataSource.getRepository(GameTicket);
    const hasGames = await gameRepository.count();
    const hasTickets = await ticketRepository.count();

    if (hasGames > 0 && hasTickets > 0) {
        return;
    }

    // The schema pairs each team 1:1 with its own home stadium
    // (team.stadium_id and stadium.home_team_id are both unique), so the two
    // teams cannot share a stadium. We create teams first with a null
    // stadium_id, then create a dedicated stadium per team and link them.
    const teamRepository = AppDataSource.getRepository(Team);

    const homeTeam = await ensureTeam("Red Lions", "Belgrade", null);
    const awayTeam = await ensureTeam("Blue Eagles", "Novi Sad", null);

    const homeStadium = await ensureStadium("National Arena", "Belgrade", 55000, homeTeam.id);
    const awayStadium = await ensureStadium("Eagle Park", "Novi Sad", 32000, awayTeam.id);

    if (homeTeam.stadium_id !== homeStadium.id) {
        homeTeam.stadium_id = homeStadium.id;
        await teamRepository.save(homeTeam);
    }

    if (awayTeam.stadium_id !== awayStadium.id) {
        awayTeam.stadium_id = awayStadium.id;
        await teamRepository.save(awayTeam);
    }

    // The game is hosted at the home team's stadium.
    const seats = await ensureSeats(homeStadium.id);
    const game = await ensureGame(homeStadium.id, homeTeam.id, awayTeam.id);
    await ensureTickets(game.id, seats);
};

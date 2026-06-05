import { AppDataSource } from "./data-source";

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize()

        return AppDataSource;
    } catch (error) {
        throw error;
    }
}

export const getDataSouce = () => {
    if(!AppDataSource.isInitialized) {
        throw new Error("Baza nije inicijalizovana. Pozovite initializeDatabase() prvo");
    }

    return AppDataSource;
}
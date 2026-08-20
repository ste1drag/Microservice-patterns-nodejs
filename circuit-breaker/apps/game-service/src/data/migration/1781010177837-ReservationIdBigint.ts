import { MigrationInterface, QueryRunner } from "typeorm";

export class ReservationIdBigint1781010177837 implements MigrationInterface {
    name = 'ReservationIdBigint1781010177837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_ticket" DROP COLUMN "reservation_id"`);
        await queryRunner.query(`ALTER TABLE "game_ticket" ADD "reservation_id" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_ticket" DROP COLUMN "reservation_id"`);
        await queryRunner.query(`ALTER TABLE "game_ticket" ADD "reservation_id" integer`);
    }

}

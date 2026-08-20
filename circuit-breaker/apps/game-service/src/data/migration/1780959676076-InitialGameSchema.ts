import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialGameSchema1780959676076 implements MigrationInterface {
    name = 'InitialGameSchema1780959676076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stadium_seat" ("id" SERIAL NOT NULL, "stadium_id" integer NOT NULL, "level" integer NOT NULL, "seat_number" integer NOT NULL, CONSTRAINT "PK_2d4771fa5a47b26cf45e10d48f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stadium" ("id" SERIAL NOT NULL, "home_team_id" integer NOT NULL, "name" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "capacity" character varying(255) NOT NULL, CONSTRAINT "REL_3fbbcd6ef17a1d2afc73ecd59d" UNIQUE ("home_team_id"), CONSTRAINT "PK_e1fec3f13003877cd87a990655d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "stadium_id" integer, "name" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, CONSTRAINT "REL_15d888c6fa7a39ad2281933446" UNIQUE ("stadium_id"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_ticket" ("id" SERIAL NOT NULL, "reservation_id" integer, "game_id" integer NOT NULL, "seat_id" integer NOT NULL, "price" integer NOT NULL, "reserved_at" TIMESTAMP, "status" integer NOT NULL, CONSTRAINT "REL_5b6ed5e859e75ab4d039e80aeb" UNIQUE ("seat_id"), CONSTRAINT "PK_668577e236171d4a7c10622b392" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "stadium_id" integer NOT NULL, "home_team_id" integer NOT NULL, "away_team_id" integer NOT NULL, "date" date NOT NULL, CONSTRAINT "REL_b070e4ba3298505350f0be9cd2" UNIQUE ("home_team_id"), CONSTRAINT "REL_e0e1c5181941b3222eb702e8e7" UNIQUE ("away_team_id"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stadium_seat" ADD CONSTRAINT "FK_06631f6b4744519c12959b3e229" FOREIGN KEY ("stadium_id") REFERENCES "stadium"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stadium" ADD CONSTRAINT "FK_3fbbcd6ef17a1d2afc73ecd59da" FOREIGN KEY ("home_team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_15d888c6fa7a39ad22819334463" FOREIGN KEY ("stadium_id") REFERENCES "stadium"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_ticket" ADD CONSTRAINT "FK_64860f6eb2bace145f118fb75c8" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_ticket" ADD CONSTRAINT "FK_5b6ed5e859e75ab4d039e80aeb9" FOREIGN KEY ("seat_id") REFERENCES "stadium_seat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_b070e4ba3298505350f0be9cd2f" FOREIGN KEY ("home_team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_e0e1c5181941b3222eb702e8e71" FOREIGN KEY ("away_team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_896d7b1919c5439788668543801" FOREIGN KEY ("stadium_id") REFERENCES "stadium"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_896d7b1919c5439788668543801"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_e0e1c5181941b3222eb702e8e71"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_b070e4ba3298505350f0be9cd2f"`);
        await queryRunner.query(`ALTER TABLE "game_ticket" DROP CONSTRAINT "FK_5b6ed5e859e75ab4d039e80aeb9"`);
        await queryRunner.query(`ALTER TABLE "game_ticket" DROP CONSTRAINT "FK_64860f6eb2bace145f118fb75c8"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_15d888c6fa7a39ad22819334463"`);
        await queryRunner.query(`ALTER TABLE "stadium" DROP CONSTRAINT "FK_3fbbcd6ef17a1d2afc73ecd59da"`);
        await queryRunner.query(`ALTER TABLE "stadium_seat" DROP CONSTRAINT "FK_06631f6b4744519c12959b3e229"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TABLE "game_ticket"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "stadium"`);
        await queryRunner.query(`DROP TABLE "stadium_seat"`);
    }

}

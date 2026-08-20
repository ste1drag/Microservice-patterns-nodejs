import { MigrationInterface, QueryRunner } from "typeorm";

export class OutboxMessage1781100000000 implements MigrationInterface {
    name = 'OutboxMessage1781100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "outbox_message" ("id" SERIAL NOT NULL, "message_id" uuid NOT NULL, "type" character varying NOT NULL, "routing_key" character varying NOT NULL, "payload" text NOT NULL, "created_at" TIMESTAMP NOT NULL, "processed_at" TIMESTAMP, "retry_count" integer NOT NULL DEFAULT 0, "error" text, CONSTRAINT "PK_outbox_message_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_outbox_message_message_id" ON "outbox_message" ("message_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_outbox_message_message_id"`);
        await queryRunner.query(`DROP TABLE "outbox_message"`);
    }

}

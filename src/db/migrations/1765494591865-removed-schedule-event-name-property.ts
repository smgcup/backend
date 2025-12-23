import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedScheduleEventNameProperty1765494591865 implements MigrationInterface {
    name = 'RemovedScheduleEventNameProperty1765494591865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" DROP COLUMN "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" ADD "name" text NOT NULL`);
    }

}

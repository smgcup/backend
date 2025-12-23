import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNamePropertyToScheduleEventEntity1763741796777 implements MigrationInterface {
    name = 'AddedNamePropertyToScheduleEventEntity1763741796777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" ADD "name" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" DROP COLUMN "name"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedTeamEventOnScheduleEventEntity1765960415252 implements MigrationInterface {
    name = 'CreatedTeamEventOnScheduleEventEntity1765960415252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" ADD "team_event" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" DROP COLUMN "team_event"`);
    }

}

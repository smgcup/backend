import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeTeamEventOnScheduleEventEntityNotNullable1765960655473 implements MigrationInterface {
    name = 'MadeTeamEventOnScheduleEventEntityNotNullable1765960655473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" ALTER COLUMN "team_event" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event" ALTER COLUMN "team_event" DROP NOT NULL`);
    }

}

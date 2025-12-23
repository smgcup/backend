import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedScheduleEventParticipantEntity1763739453287 implements MigrationInterface {
    name = 'CreatedScheduleEventParticipantEntity1763739453287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedule_event_participant" ("event_id" uuid NOT NULL, "athlete_id" uuid NOT NULL, CONSTRAINT "PK_c79583e0d860e893c4c32bdd758" PRIMARY KEY ("event_id", "athlete_id"))`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participant" ADD CONSTRAINT "FK_5979ceb78d078f3725e945ae114" FOREIGN KEY ("event_id") REFERENCES "schedule_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participant" ADD CONSTRAINT "FK_72063f50938590c67c5b8b872f9" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event_participant" DROP CONSTRAINT "FK_72063f50938590c67c5b8b872f9"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_participant" DROP CONSTRAINT "FK_5979ceb78d078f3725e945ae114"`);
        await queryRunner.query(`DROP TABLE "schedule_event_participant"`);
    }

}

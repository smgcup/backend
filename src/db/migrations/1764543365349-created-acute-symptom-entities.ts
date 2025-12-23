import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedAcuteSymptomEntities1764543365349 implements MigrationInterface {
    name = 'CreatedAcuteSymptomEntities1764543365349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "symptom" ("id" uuid NOT NULL, "key" text NOT NULL, "label" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e6bf8581852864d312308633007" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "acute_symptom" ("id" uuid NOT NULL, "symptom_id" uuid NOT NULL, "athlete_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_ebe29145894d580cc200bcc00fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" ADD CONSTRAINT "FK_cdc0c4e41b6a7174f687d1a0a4f" FOREIGN KEY ("symptom_id") REFERENCES "symptom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" ADD CONSTRAINT "FK_b2505214d483fe7477ab75d6064" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "acute_symptom" DROP CONSTRAINT "FK_b2505214d483fe7477ab75d6064"`);
        await queryRunner.query(`ALTER TABLE "acute_symptom" DROP CONSTRAINT "FK_cdc0c4e41b6a7174f687d1a0a4f"`);
        await queryRunner.query(`DROP TABLE "acute_symptom"`);
        await queryRunner.query(`DROP TABLE "symptom"`);
    }

}

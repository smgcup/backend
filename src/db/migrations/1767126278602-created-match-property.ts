import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedMatchProperty1767126278602 implements MigrationInterface {
    name = 'CreatedMatchProperty1767126278602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."match_status_enum" AS ENUM('SCHEDULED', 'LIVE', 'FINISHED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "match" ("id" uuid NOT NULL, "date" TIMESTAMP NOT NULL, "status" "public"."match_status_enum" NOT NULL, "first_opponent_id" uuid NOT NULL, "second_opponent_id" uuid NOT NULL, CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_72be0780c460a2ff45d31b3106a" FOREIGN KEY ("first_opponent_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_edd91d470ac818952a1eba89ced" FOREIGN KEY ("second_opponent_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_edd91d470ac818952a1eba89ced"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_72be0780c460a2ff45d31b3106a"`);
        await queryRunner.query(`DROP TABLE "match"`);
        await queryRunner.query(`DROP TYPE "public"."match_status_enum"`);
    }

}

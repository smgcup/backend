import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplementedPredictionAndUserPredictionEntities1769524128062 implements MigrationInterface {
  name = 'ImplementedPredictionAndUserPredictionEntities1769524128062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_prediction_stats" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "total_points" integer NOT NULL DEFAULT '0', "exact_matches_count" integer NOT NULL DEFAULT '0', "correct_outcomes_count" integer NOT NULL DEFAULT '0', "total_predictions_count" integer NOT NULL DEFAULT '0', "last_updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4539b7e5eb38d9e20c2ba5e944a" UNIQUE ("user_id"), CONSTRAINT "UQ_4539b7e5eb38d9e20c2ba5e944a" UNIQUE ("user_id"), CONSTRAINT "REL_4539b7e5eb38d9e20c2ba5e944" UNIQUE ("user_id"), CONSTRAINT "PK_9f566607867f8a3ea49f1498999" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "prediction" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "match_id" uuid NOT NULL, "predicted_score1" integer, "predicted_score2" integer, "points_earned" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_89c9642a0338f032c09b3476524" UNIQUE ("user_id", "match_id"), CONSTRAINT "PK_23df2ceecea9f8bbb996ff056a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_prediction_stats" ADD CONSTRAINT "FK_4539b7e5eb38d9e20c2ba5e944a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prediction" ADD CONSTRAINT "FK_6e194969e47ef73d43ec6c018ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prediction" ADD CONSTRAINT "FK_433f8597a02c4c579ac99d57184" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prediction" DROP CONSTRAINT "FK_433f8597a02c4c579ac99d57184"`);
    await queryRunner.query(`ALTER TABLE "prediction" DROP CONSTRAINT "FK_6e194969e47ef73d43ec6c018ce"`);
    await queryRunner.query(`ALTER TABLE "user_prediction_stats" DROP CONSTRAINT "FK_4539b7e5eb38d9e20c2ba5e944a"`);
    await queryRunner.query(`DROP TABLE "prediction"`);
    await queryRunner.query(`DROP TABLE "user_prediction_stats"`);
  }
}

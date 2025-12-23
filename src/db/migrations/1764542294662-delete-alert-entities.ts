import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteAlertEntities1720000000000 implements MigrationInterface {
  name = 'DeleteAlertEntities1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_976e67503908a38e535d3d6377d"`); // alert.type -> alert_type
    await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_58ccb2a75a3235a04b95e227729"`); // alert.notification_id -> notification

    // Drop the tables
    await queryRunner.query(`DROP TABLE IF EXISTS "alert"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "alert_type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate alert_type
    await queryRunner.query(`
            CREATE TABLE "alert_type" (
                "id" uuid NOT NULL,
                "key" text NOT NULL,
                "label" text NOT NULL,
                CONSTRAINT "PK_34f04b83e501fb1bea31e237418" PRIMARY KEY ("id")
            )
        `);

    // Recreate alert
    await queryRunner.query(`
            CREATE TABLE "alert" (
                "id" uuid NOT NULL,
                "notification_id" uuid NOT NULL,
                "type" uuid NOT NULL,
                CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id")
            )
        `);

    // restore FKs
    await queryRunner.query(`
            ALTER TABLE "alert" ADD CONSTRAINT "FK_58ccb2a75a3235a04b95e227729"
            FOREIGN KEY ("notification_id") REFERENCES "notification"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "alert" ADD CONSTRAINT "FK_976e67503908a38e535d3d6377d"
            FOREIGN KEY ("type") REFERENCES "alert_type"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}

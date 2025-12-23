import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedNotificationAndAlertEntities1764471814427 implements MigrationInterface {
    name = 'CreatedNotificationAndAlertEntities1764471814427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification_type" ("id" uuid NOT NULL, "key" text NOT NULL, "label" text NOT NULL, CONSTRAINT "PK_3e0e1fa68c25d84f808ca11dbaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL, "title" text NOT NULL, "sub_title" text NOT NULL, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "type" uuid NOT NULL, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alert_type" ("id" uuid NOT NULL, "key" text NOT NULL, "label" text NOT NULL, CONSTRAINT "PK_34f04b83e501fb1bea31e237418" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alert" ("id" uuid NOT NULL, "notification_id" uuid NOT NULL, "type" uuid NOT NULL, CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_33f33cc8ef29d805a97ff4628b1" FOREIGN KEY ("type") REFERENCES "notification_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_58ccb2a75a3235a04b95e227729" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_976e67503908a38e535d3d6377d" FOREIGN KEY ("type") REFERENCES "alert_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_976e67503908a38e535d3d6377d"`);
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_58ccb2a75a3235a04b95e227729"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_33f33cc8ef29d805a97ff4628b1"`);
        await queryRunner.query(`DROP TABLE "alert"`);
        await queryRunner.query(`DROP TABLE "alert_type"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "notification_type"`);
    }

}

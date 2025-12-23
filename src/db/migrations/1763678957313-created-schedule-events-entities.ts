import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedScheduleEventsEntities1763678957313 implements MigrationInterface {
    name = 'CreatedScheduleEventsEntities1763678957313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedule_event_type" ("id" uuid NOT NULL, "key" text NOT NULL, "name" text NOT NULL, "description" text, "team_id" uuid, "is_system" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_a4936daa49cbddaf5d2fb39344f" UNIQUE ("key"), CONSTRAINT "PK_0545e56c05a110e491c2b79ee75" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule_event_field" ("id" uuid NOT NULL, "key" text NOT NULL, "default_label" text NOT NULL, "data_type" text NOT NULL, CONSTRAINT "UQ_50bd0dd9e3dcd5533f8ffc8cd52" UNIQUE ("key"), CONSTRAINT "PK_6cd5ba0bfb065684314f09575ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule_event_field_value" ("id" uuid NOT NULL, "event_id" uuid NOT NULL, "field_id" uuid NOT NULL, "value_string" text, "value_number" numeric, "value_boolean" boolean, "value_datetime" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8777b4b1876626725b000b0c66f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule_event" ("id" uuid NOT NULL, "team_id" uuid NOT NULL, "type_id" uuid NOT NULL, "title" text NOT NULL, "description" text, "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, "location_text" text, CONSTRAINT "PK_d658c2629387690dca1f793d410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule_event_type_field" ("id" uuid NOT NULL, "type_id" uuid NOT NULL, "field_id" uuid NOT NULL, "label" text NOT NULL, "required" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT '0', CONSTRAINT "uq_type_field" UNIQUE ("type_id", "field_id"), CONSTRAINT "PK_8d56570251a9d34d3d6f25d1ef7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "schedule_event_type" ADD CONSTRAINT "FK_89c6208dbb1c96ee633e4ec1c2c" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_field_value" ADD CONSTRAINT "FK_42d8d87624304e298c5a6f58e66" FOREIGN KEY ("event_id") REFERENCES "schedule_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_field_value" ADD CONSTRAINT "FK_21adeac1697ba562ad8abb7faf2" FOREIGN KEY ("field_id") REFERENCES "schedule_event_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event" ADD CONSTRAINT "FK_b2162883ee0c46ad602d220190c" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event" ADD CONSTRAINT "FK_0545e56c05a110e491c2b79ee75" FOREIGN KEY ("type_id") REFERENCES "schedule_event_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_type_field" ADD CONSTRAINT "FK_2412e1381803b63219859a94c26" FOREIGN KEY ("type_id") REFERENCES "schedule_event_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_event_type_field" ADD CONSTRAINT "FK_ae7f407411d114c331cf07c2358" FOREIGN KEY ("field_id") REFERENCES "schedule_event_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_event_type_field" DROP CONSTRAINT "FK_ae7f407411d114c331cf07c2358"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_type_field" DROP CONSTRAINT "FK_2412e1381803b63219859a94c26"`);
        await queryRunner.query(`ALTER TABLE "schedule_event" DROP CONSTRAINT "FK_0545e56c05a110e491c2b79ee75"`);
        await queryRunner.query(`ALTER TABLE "schedule_event" DROP CONSTRAINT "FK_b2162883ee0c46ad602d220190c"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_field_value" DROP CONSTRAINT "FK_21adeac1697ba562ad8abb7faf2"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_field_value" DROP CONSTRAINT "FK_42d8d87624304e298c5a6f58e66"`);
        await queryRunner.query(`ALTER TABLE "schedule_event_type" DROP CONSTRAINT "FK_89c6208dbb1c96ee633e4ec1c2c"`);
        await queryRunner.query(`DROP TABLE "schedule_event_type_field"`);
        await queryRunner.query(`DROP TABLE "schedule_event"`);
        await queryRunner.query(`DROP TABLE "schedule_event_field_value"`);
        await queryRunner.query(`DROP TABLE "schedule_event_field"`);
        await queryRunner.query(`DROP TABLE "schedule_event_type"`);
    }

}

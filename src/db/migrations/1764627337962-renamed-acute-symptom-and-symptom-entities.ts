import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamedAcuteSymptomAndSymptomEntities1764627337962 implements MigrationInterface {
  name = 'RenamedAcuteSymptomAndSymptomEntities1764627337962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop foreign key constraints from acute_symptom (need to do this first)
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP CONSTRAINT IF EXISTS "FK_7d035f2d9e2486fc4cca0a91447"`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP CONSTRAINT IF EXISTS "FK_b2505214d483fe7477ab75d6064"`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP CONSTRAINT IF EXISTS "FK_cdc0c4e41b6a7174f687d1a0a4f"`);

    // Step 2: Make symptom_id, athlete_id, and notification_id nullable so we can insert symptom records
    await queryRunner.query(`ALTER TABLE "acute_symptom" ALTER COLUMN "symptom_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" ALTER COLUMN "athlete_id" DROP NOT NULL`);

    // Step 3: Add key and label columns as nullable first to acute_symptom
    await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "key" text`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "label" text`);

    // Step 4: Migrate ALL data from symptom table to acute_symptom table
    // First, update existing rows in acute_symptom with key and label from symptom table
    await queryRunner.query(
      `UPDATE "acute_symptom" SET "key" = "symptom"."key", "label" = "symptom"."label" FROM "symptom" WHERE "acute_symptom"."symptom_id" = "symptom"."id"`,
    );

    // Then, insert ALL symptom records that don't exist in acute_symptom yet
    // This ensures ALL symptom IDs exist in acute_symptom before we create the foreign key
    await queryRunner.query(
      `INSERT INTO "acute_symptom" ("id", "key", "label", "created_at") 
       SELECT "id", "key", "label", "created_at" 
       FROM "symptom" 
       WHERE "id" NOT IN (SELECT "id" FROM "acute_symptom")`,
    );

    // Step 5: Now make key and label NOT NULL (all rows should have values now)
    await queryRunner.query(`ALTER TABLE "acute_symptom" ALTER COLUMN "key" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" ALTER COLUMN "label" SET NOT NULL`);

    // Step 6: Create the new triggered_acute_symptom table
    await queryRunner.query(
      `CREATE TABLE "triggered_acute_symptom" ("id" uuid NOT NULL, "symptom_id" uuid NOT NULL, "athlete_id" uuid NOT NULL, "notification_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_c040ba666f0f686d0ddc67ac5bc" PRIMARY KEY ("id"))`,
    );

    // Step 7: Migrate data from acute_symptom to triggered_acute_symptom
    // Only copy records where symptom_id exists in acute_symptom (after migration)
    // This filters out any orphaned references that might have invalid symptom_id values
    await queryRunner.query(
      `INSERT INTO "triggered_acute_symptom" ("id", "symptom_id", "athlete_id", "notification_id", "created_at") 
       SELECT "as1"."id", "as1"."symptom_id", "as1"."athlete_id", "as1"."notification_id", "as1"."created_at" 
       FROM "acute_symptom" "as1"
       INNER JOIN "acute_symptom" "as2" ON "as1"."symptom_id" = "as2"."id"
       WHERE "as2"."key" IS NOT NULL`,
    );

    // Step 8: Drop the old columns from acute_symptom
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "symptom_id"`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "athlete_id"`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "notification_id"`);

    // Step 9: Drop the old symptom table (data has been migrated)
    await queryRunner.query(`DROP TABLE "symptom"`);

    // Step 10: Add foreign key constraints to triggered_acute_symptom
    // Now all symptom_id values in triggered_acute_symptom should exist in acute_symptom
    await queryRunner.query(
      `ALTER TABLE "triggered_acute_symptom" ADD CONSTRAINT "FK_406ba7895d07686f3237936de02" FOREIGN KEY ("symptom_id") REFERENCES "acute_symptom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggered_acute_symptom" ADD CONSTRAINT "FK_a2bb344293e3b840ba05ca5434f" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggered_acute_symptom" ADD CONSTRAINT "FK_ea0036ab1b137d3d227f17a82ab" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop foreign key constraints from triggered_acute_symptom
    await queryRunner.query(
      `ALTER TABLE "triggered_acute_symptom" DROP CONSTRAINT IF EXISTS "FK_ea0036ab1b137d3d227f17a82ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggered_acute_symptom" DROP CONSTRAINT IF EXISTS "FK_a2bb344293e3b840ba05ca5434f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggered_acute_symptom" DROP CONSTRAINT IF EXISTS "FK_406ba7895d07686f3237936de02"`,
    );

    // Step 2: Recreate the symptom table
    await queryRunner.query(
      `CREATE TABLE "symptom" ("id" uuid NOT NULL, "key" text NOT NULL, "label" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e6bf8581852864d312308633007" PRIMARY KEY ("id"))`,
    );

    // Step 3: Migrate data from acute_symptom back to symptom
    await queryRunner.query(
      `INSERT INTO "symptom" ("id", "key", "label", "created_at") SELECT "id", "key", "label", "created_at" FROM "acute_symptom"`,
    );

    // Step 4: Add back columns to acute_symptom
    await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "symptom_id" uuid`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "athlete_id" uuid`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" ADD "notification_id" uuid`);

    // Step 5: Migrate data from triggered_acute_symptom back to acute_symptom
    await queryRunner.query(
      `UPDATE "acute_symptom" SET "symptom_id" = "triggered_acute_symptom"."symptom_id", "athlete_id" = "triggered_acute_symptom"."athlete_id", "notification_id" = "triggered_acute_symptom"."notification_id" FROM "triggered_acute_symptom" WHERE "acute_symptom"."id" = "triggered_acute_symptom"."id"`,
    );

    // Step 6: Make columns NOT NULL
    await queryRunner.query(`ALTER TABLE "acute_symptom" ALTER COLUMN "symptom_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" ALTER COLUMN "athlete_id" SET NOT NULL`);

    // Step 7: Drop key and label columns
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "label"`);
    await queryRunner.query(`ALTER TABLE "acute_symptom" DROP COLUMN "key"`);

    // Step 8: Drop triggered_acute_symptom table
    await queryRunner.query(`DROP TABLE "triggered_acute_symptom"`);

    // Step 9: Add back foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "acute_symptom" ADD CONSTRAINT "FK_cdc0c4e41b6a7174f687d1a0a4f" FOREIGN KEY ("symptom_id") REFERENCES "symptom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "acute_symptom" ADD CONSTRAINT "FK_b2505214d483fe7477ab75d6064" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "acute_symptom" ADD CONSTRAINT "FK_7d035f2d9e2486fc4cca0a91447" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

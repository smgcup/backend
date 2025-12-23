import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOptionsToJsonb1761395000000 implements MigrationInterface {
  name = 'UpdateOptionsToJsonb1761395000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update any existing text values to proper JSON format
    await queryRunner.query(`
            UPDATE health_factor_property 
            SET options = CASE 
                WHEN options IS NULL THEN NULL
                WHEN options = '' THEN NULL
                ELSE options
            END
        `);

    // Then change the column type to jsonb
    await queryRunner.query(
      `ALTER TABLE "health_factor_property" ALTER COLUMN "options" TYPE jsonb USING options::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert back to text
    await queryRunner.query(
      `ALTER TABLE "health_factor_property" ALTER COLUMN "options" TYPE text USING options::text`,
    );
  }
}

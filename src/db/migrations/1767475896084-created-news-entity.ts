import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedNewsEntity1767475896084 implements MigrationInterface {
  name = 'CreatedNewsEntity1767475896084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "news" ("id" uuid NOT NULL, "title" text NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL, "category" text NOT NULL, "image_url" text NOT NULL, CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "news"`);
  }
}

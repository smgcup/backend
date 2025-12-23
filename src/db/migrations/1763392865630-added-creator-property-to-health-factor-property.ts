import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCreatorPropertyToHealthFactorProperty1763392865630 implements MigrationInterface {
    name = 'AddedCreatorPropertyToHealthFactorProperty1763392865630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_property" ADD "creator_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" ADD CONSTRAINT "FK_0b7bf3d2e3f5b8ff11fc5feefd9" FOREIGN KEY ("creator_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factor_property" DROP CONSTRAINT "FK_0b7bf3d2e3f5b8ff11fc5feefd9"`);
        await queryRunner.query(`ALTER TABLE "health_factor_property" DROP COLUMN "creator_id"`);
    }

}

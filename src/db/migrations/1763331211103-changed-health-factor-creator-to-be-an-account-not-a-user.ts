import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedHealthFactorCreatorToBeAnAccountNotAUser1763331211103 implements MigrationInterface {
    name = 'ChangedHealthFactorCreatorToBeAnAccountNotAUser1763331211103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factors" DROP CONSTRAINT "FK_3d0522bbbe750820696b91a9009"`);
        await queryRunner.query(`ALTER TABLE "health_factors" ADD CONSTRAINT "FK_3d0522bbbe750820696b91a9009" FOREIGN KEY ("creator_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_factors" DROP CONSTRAINT "FK_3d0522bbbe750820696b91a9009"`);
        await queryRunner.query(`ALTER TABLE "health_factors" ADD CONSTRAINT "FK_3d0522bbbe750820696b91a9009" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

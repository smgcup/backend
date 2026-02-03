import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedAssistPlayerInTheMatchEventEntity1768342127266 implements MigrationInterface {
  name = 'CreatedAssistPlayerInTheMatchEventEntity1768342127266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" ADD "assist_player_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "match_event" ADD CONSTRAINT "FK_d041c14dc1bfbaf948cbaea4c57" FOREIGN KEY ("assist_player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_event" DROP CONSTRAINT "FK_d041c14dc1bfbaf948cbaea4c57"`);
    await queryRunner.query(`ALTER TABLE "match_event" DROP COLUMN "assist_player_id"`);
  }
}

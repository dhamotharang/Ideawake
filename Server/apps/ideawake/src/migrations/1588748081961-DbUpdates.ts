import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1588748081961 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" ADD "user_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD CONSTRAINT "FK_68a2ec8d07dd827da8d67d6560e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" DROP CONSTRAINT "FK_68a2ec8d07dd827da8d67d6560e"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" DROP COLUMN "user_id"`,
      undefined,
    );
  }
}

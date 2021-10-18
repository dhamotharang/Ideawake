import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1588140051446 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "expiry_start_date" TIMESTAMP WITH TIME ZONE`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "expiry_end_date" TIMESTAMP WITH TIME ZONE`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "have_expiry" boolean DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "have_expiry"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "expiry_end_date"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "expiry_start_date"`,
      undefined,
    );
  }
}

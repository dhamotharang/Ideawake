import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1608733797826 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "draft" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.challenge SET draft = false;`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "draft" SET DEFAULT true`,
      undefined,
    );
  }
}

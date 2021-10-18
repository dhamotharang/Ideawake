import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1615969359963 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "draft" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "draft" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "draft" SET DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "draft" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "draft" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "draft" DROP NOT NULL`,
      undefined,
    );
  }
}

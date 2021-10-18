import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1588759150892 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "mentions"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "mentions" integer array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "mentions"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "mentions" integer array`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "mentions"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "mentions" text array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "mentions"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "mentions" text array`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1606831140739 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "tags" SET DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "mentions" SET DEFAULT '{}'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "mentions" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "tags" DROP DEFAULT`,
      undefined,
    );
  }
}

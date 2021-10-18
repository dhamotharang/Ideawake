import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1582036480609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "tags"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "tags" numeric array`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "tags"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "tags" text array`,
      undefined,
    );
  }
}

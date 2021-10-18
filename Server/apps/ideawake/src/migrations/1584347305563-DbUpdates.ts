import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584347305563 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "view_count" bigint NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "view_count"`,
      undefined,
    );
  }
}

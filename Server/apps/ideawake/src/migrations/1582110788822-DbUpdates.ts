import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1582110788822 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "view_count" bigint NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "view_count"`,
      undefined,
    );
  }
}

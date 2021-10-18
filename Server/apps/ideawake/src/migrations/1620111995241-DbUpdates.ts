import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1620111995241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" ADD "filter_options" json`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" ADD "column_options" json`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" DROP COLUMN "column_options"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" DROP COLUMN "filter_options"`,
      undefined,
    );
  }
}

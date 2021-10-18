import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1601633580005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "view_bookmarked_view" smallint NOT NULL DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_bookmarked_view" smallint NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_bookmarked_view"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "view_bookmarked_view"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1619002656147 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_opportunity_columns" smallint NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_opportunity_columns"`,
      undefined,
    );
  }
}

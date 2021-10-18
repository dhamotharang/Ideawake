import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1595935888590 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "view_stage_specific_tab" integer DEFAULT 1`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "view_stage_specific_tab"`,
      undefined,
    );
  }
}

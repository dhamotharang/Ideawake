import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585824670661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_opportunity_type" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_opportunity_type" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "delete_opportunity_type" integer DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "delete_opportunity_type"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_opportunity_type"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_opportunity_type"`,
      undefined,
    );
  }
}

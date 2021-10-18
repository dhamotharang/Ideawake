import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1615216858298 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "export_opportunity" integer NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "export_opportunity"`,
      undefined,
    );
  }
}

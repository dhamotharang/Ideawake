import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585664962832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "access_points_settings" integer DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "access_points_settings"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1614254436205 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" ADD "is_pending" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_pending" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "last_login" DROP NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "last_login" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_pending"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" DROP COLUMN "is_pending"`,
      undefined,
    );
  }
}

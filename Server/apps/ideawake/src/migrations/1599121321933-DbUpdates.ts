import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1599121321933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "community_login_with_sso_enum" AS ENUM('disabled', 'only_sso', 'both')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD "login_with_sso" "community_login_with_sso_enum" NOT NULL DEFAULT 'disabled'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "login_with_sso"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "community_login_with_sso_enum"`,
      undefined,
    );
  }
}

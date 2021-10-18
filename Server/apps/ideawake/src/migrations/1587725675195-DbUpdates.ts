import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587725675195 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "redirect_url" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" DROP COLUMN "client_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD "client_id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" DROP COLUMN "client_secret"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD "client_secret" uuid NOT NULL DEFAULT uuid_generate_v4()`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "token" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "authorize_with" SET DEFAULT 'ideawake'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "authorize_with" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "token" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" DROP COLUMN "client_secret"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD "client_secret" character varying(250) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" DROP COLUMN "client_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD "client_id" character varying(250) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "redirect_url" SET NOT NULL`,
      undefined,
    );
  }
}

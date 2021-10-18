import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584517445803 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "has_additional_brief" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "additional_brief" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "sponsors" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "sponsors" SET DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "moderators" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "moderators" SET DEFAULT '{}'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "moderators" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "moderators" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "sponsors" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "sponsors" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "additional_brief"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "has_additional_brief"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1606737726718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "enable_dup_detection" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "duplicatable_types" integer array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "enable_dup_detection" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "challenge_only_duplicates" boolean NOT NULL DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "challenge_only_duplicates"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "enable_dup_detection"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "duplicatable_types"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "enable_dup_detection"`,
      undefined,
    );
  }
}

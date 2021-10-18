import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1609916622093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "workflow" ADD "old_platform_id" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "old_platform_id" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "old_platform_id" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "old_platform_id" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "old_platform_id" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "old_platform_id" text`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "old_platform_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "old_platform_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "old_platform_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "old_platform_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "old_platform_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow" DROP COLUMN "old_platform_id"`,
      undefined,
    );
  }
}

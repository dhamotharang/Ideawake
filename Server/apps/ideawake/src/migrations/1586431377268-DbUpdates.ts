import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1586431377268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "roles"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "roles" integer array DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "individuals"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "individuals" integer array DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "groups"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "groups" integer array DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ALTER COLUMN "public" SET DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ALTER COLUMN "public" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "groups"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "groups" text array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "individuals"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "individuals" text array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "roles"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "roles" text array`,
      undefined,
    );
  }
}

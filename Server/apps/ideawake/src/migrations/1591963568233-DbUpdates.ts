import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1591963568233 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "access_custom_field_settings" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "create_custom_field" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_custom_field" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_custom_field_options" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "soft_delete_custom_field" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_custom_field_data" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "view_custom_field_data" integer DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "view_custom_field_data"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_custom_field_data"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "soft_delete_custom_field"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_custom_field_options"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_custom_field"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "create_custom_field"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "access_custom_field_settings"`,
      undefined,
    );
  }
}

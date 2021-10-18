import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1595500628087 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "temp_entity_object_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.entity_visibility_setting vis
        SET temp_entity_object_id = CAST (vis.entity_object_id AS INTEGER);`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "entity_object_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "entity_object_id" integer`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.entity_visibility_setting vis
        SET entity_object_id = vis.temp_entity_object_id`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "temp_entity_object_id"`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ALTER COLUMN "entity_object_id" SET NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "temp_entity_object_id" character varying(300)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.entity_visibility_setting vis
        SET temp_entity_object_id = CAST (vis.entity_object_id AS VARCHAR(300));`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "entity_object_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD "entity_object_id" character varying(300)`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.entity_visibility_setting vis
        SET entity_object_id = vis.temp_entity_object_id`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP COLUMN "temp_entity_object_id"`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ALTER COLUMN "entity_object_id" SET NOT NULL`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1612953264991 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting SET temp_title = community_appearance_setting.jumbotron_page_title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "jumbotron_page_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "jumbotron_page_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting SET jumbotron_page_title = community_appearance_setting.temp_title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ALTER COLUMN "jumbotron_page_title" SET NOT NULL`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "temp_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting SET temp_description = community_appearance_setting.jumbotron_page_description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "jumbotron_page_description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "jumbotron_page_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting SET jumbotron_page_description = community_appearance_setting.temp_description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "temp_description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ALTER COLUMN "jumbotron_page_description" SET NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting SET temp_title = community_appearance_setting.jumbotron_page_title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "jumbotron_page_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "jumbotron_page_title" character varying(250)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting
          SET jumbotron_page_title = CAST (community_appearance_setting.temp_title AS character varying(250));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ALTER COLUMN "jumbotron_page_title" SET NOT NULL`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "temp_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting SET temp_description = community_appearance_setting.jumbotron_page_description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "jumbotron_page_description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD "jumbotron_page_description" character varying(250)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_appearance_setting
            SET jumbotron_page_description = CAST (community_appearance_setting.temp_description AS character varying(250));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP COLUMN "temp_description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ALTER COLUMN "jumbotron_page_description" SET NOT NULL`,
      undefined,
    );
  }
}

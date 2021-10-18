import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1608041708821 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP CONSTRAINT "UQ_92d7012572667feb7941a3292ab"`,
      undefined,
    );

    // Updating title's type.
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_title = field.title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET title = field.temp_title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ALTER COLUMN "title" SET NOT NULL;`,
      undefined,
    );

    // Updating description's type.
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_description = field.description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET description = field.temp_description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_description"`,
      undefined,
    );

    // Updating placeholder_text's type.
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_placeholder_text" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_placeholder_text = field.placeholder_text;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "placeholder_text"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "placeholder_text" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET placeholder_text = field.temp_placeholder_text;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_placeholder_text"`,
      undefined,
    );

    // Updating unique_id's type.
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_unique_id" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_unique_id = field.unique_id;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "unique_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "unique_id" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET unique_id = field.temp_unique_id;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_unique_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ALTER COLUMN "unique_id" SET NOT NULL;`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD CONSTRAINT "UQ_92d7012572667feb7941a3292ab" UNIQUE ("unique_id", "community_id")`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP CONSTRAINT "UQ_92d7012572667feb7941a3292ab"`,
      undefined,
    );

    // unique_id
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_unique_id" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_unique_id = field.unique_id;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "unique_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "unique_id" character varying(250)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field
        SET unique_id = CAST (field.temp_unique_id AS character varying(250));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_unique_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ALTER COLUMN "unique_id" SET NOT NULL;`,
      undefined,
    );

    // placeholder_text
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_placeholder_text" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_placeholder_text = field.placeholder_text;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "placeholder_text"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "placeholder_text" character varying(2000)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field
        SET placeholder_text = CAST (field.temp_placeholder_text AS character varying(2000));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_placeholder_text"`,
      undefined,
    );

    // description
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_description = field.description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "description" character varying(2000)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field
        SET description = CAST (field.temp_description AS character varying(2000));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_description"`,
      undefined,
    );

    // title
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field SET temp_title = field.title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "title" character varying(250)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field field
        SET title = CAST (field.temp_title AS character varying(250));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ALTER COLUMN "title" SET NOT NULL;`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD CONSTRAINT "UQ_92d7012572667feb7941a3292ab" UNIQUE ("unique_id", "community_id")`,
      undefined,
    );
  }
}

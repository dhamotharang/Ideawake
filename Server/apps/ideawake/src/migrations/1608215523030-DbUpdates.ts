import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1608215523030 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.evaluation_criteria criteria SET temp_title = criteria.title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.evaluation_criteria criteria SET title = criteria.temp_title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ALTER COLUMN "title" SET NOT NULL;`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.evaluation_criteria criteria SET temp_title = criteria.title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "title" character varying(250)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.evaluation_criteria criteria
        SET title = CAST (criteria.temp_title AS character varying(250));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ALTER COLUMN "title" SET NOT NULL;`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1608708041850 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.opportunity SET temp_title = opportunity.title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.opportunity SET title = opportunity.temp_title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "title" SET NOT NULL;`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "temp_title" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.opportunity SET temp_title = opportunity.title;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "title" character varying(250)`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.opportunity
        SET title = CAST (opportunity.temp_title AS character varying(250));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "temp_title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "title" SET NOT NULL;`,
      undefined,
    );
  }
}

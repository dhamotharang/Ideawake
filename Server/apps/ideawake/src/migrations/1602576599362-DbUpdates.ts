import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1602576599362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "temp_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.opportunity
        SET temp_description = description;`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "description" text`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.opportunity
        SET description = temp_description;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "temp_description"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "temp_description" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.opportunity
        SET temp_description = description;`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "description" character varying(2000)`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.opportunity opp
        SET description = LEFT(opp.temp_description, 2000);`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "temp_description"`,
      undefined,
    );
  }
}

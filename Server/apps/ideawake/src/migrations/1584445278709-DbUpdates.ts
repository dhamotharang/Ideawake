import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584445278709 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`TRUNCATE public.entity_type CASCADE;`, undefined);

    await queryRunner.query(
      `ALTER TABLE "entity_type" ADD "entity_table" character varying(250) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_type" ADD CONSTRAINT "UQ_95ea4e1619dbdb1cfdabaa902a0" UNIQUE ("entity_table")`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_type" DROP CONSTRAINT "UQ_95ea4e1619dbdb1cfdabaa902a0"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_type" DROP COLUMN "entity_table"`,
      undefined,
    );
  }
}

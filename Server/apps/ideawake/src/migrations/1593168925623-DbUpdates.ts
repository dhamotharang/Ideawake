import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1593168925623 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" DROP CONSTRAINT "FK_6627e7b5000d3569875b9a0914d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" DROP COLUMN "stage_id"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ADD "stage_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ADD CONSTRAINT "FK_6627e7b5000d3569875b9a0914d" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1593504933371 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" ADD "field_integration_type" character varying array DEFAULT '{}'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" DROP COLUMN "field_integration_type"`,
      undefined,
    );
  }
}

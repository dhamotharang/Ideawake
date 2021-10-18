import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1620721768566 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "enable_linking" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "linkeble_types" integer array DEFAULT '{}'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "linkeble_types"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "enable_linking"`,
      undefined,
    );
  }
}

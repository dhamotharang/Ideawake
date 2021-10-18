import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594301865743 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DELETE FROM "evaluation_criteria"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "criteria_weight"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "criteria_weight" double precision NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP COLUMN "criteria_weight"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD "criteria_weight" integer NOT NULL`,
      undefined,
    );
  }
}

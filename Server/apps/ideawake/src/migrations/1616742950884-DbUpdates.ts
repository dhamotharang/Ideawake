import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1616742950884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "curr_stage_score" double precision`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "total_score" double precision`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "total_score"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "curr_stage_score"`,
      undefined,
    );
  }
}

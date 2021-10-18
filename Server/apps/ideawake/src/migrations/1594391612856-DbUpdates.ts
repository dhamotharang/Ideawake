import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594391612856 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ADD "final_score" double precision`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" DROP COLUMN "final_score"`,
      undefined,
    );
  }
}

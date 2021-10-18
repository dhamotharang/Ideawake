import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1620812926382 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" DROP CONSTRAINT "UQ_7bdbb2e3e4ba28e23a9a730e327"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ADD CONSTRAINT "UQ_7bdbb2e3e4ba28e23a9a730e327" UNIQUE ("community_id", "opportunity_id", "linked_opportunity_id")`,
      undefined,
    );
  }
}

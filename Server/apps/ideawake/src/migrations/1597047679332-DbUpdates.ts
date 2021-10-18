import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597047679332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "workflow_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "workflow_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD CONSTRAINT "FK_2a6b4a1a6ad47e6cb3c0011b1a2" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_7227bac70b48c55461131e4f15e" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_7227bac70b48c55461131e4f15e"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP CONSTRAINT "FK_2a6b4a1a6ad47e6cb3c0011b1a2"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "workflow_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "workflow_id"`,
      undefined,
    );
  }
}

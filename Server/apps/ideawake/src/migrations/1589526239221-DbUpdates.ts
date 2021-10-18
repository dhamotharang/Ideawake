import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589526239221 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "stage_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "work_flow_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_3b0a5c967ecb104a80a14fe95cb" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_23c2fe1ac2f965ec812b6db370a" FOREIGN KEY ("work_flow_id") REFERENCES "workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_23c2fe1ac2f965ec812b6db370a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_3b0a5c967ecb104a80a14fe95cb"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "work_flow_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "stage_id"`,
      undefined,
    );
  }
}

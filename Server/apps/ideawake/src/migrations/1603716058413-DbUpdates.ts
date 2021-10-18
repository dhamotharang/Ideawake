import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1603716058413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_history" ADD "status_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ADD CONSTRAINT "FK_f8506bef7de43323557543761b0" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_history" DROP CONSTRAINT "FK_f8506bef7de43323557543761b0"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" DROP COLUMN "status_id"`,
      undefined,
    );
  }
}

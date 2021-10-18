import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594815887577 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_history" ALTER COLUMN "entering_at" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ALTER COLUMN "exiting_at" DROP DEFAULT`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_history" ALTER COLUMN "exiting_at" SET DEFAULT now()`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ALTER COLUMN "entering_at" SET DEFAULT now()`,
      undefined,
    );
  }
}

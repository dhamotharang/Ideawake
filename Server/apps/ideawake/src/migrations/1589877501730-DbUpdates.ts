import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589877501730 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "stage_attachment_date" TIMESTAMP WITH TIME ZONE DEFAULT null`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "stage_attachment_date"`,
      undefined,
    );
  }
}

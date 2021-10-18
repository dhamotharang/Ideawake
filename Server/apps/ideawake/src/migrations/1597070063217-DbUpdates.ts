import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597070063217 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" ALTER COLUMN "title" DROP NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" ALTER COLUMN "title" SET NOT NULL`,
      undefined,
    );
  }
}

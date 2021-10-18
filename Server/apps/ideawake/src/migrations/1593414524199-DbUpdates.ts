import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1593414524199 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "custom_field_assignee" json`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "custom_field_assignee"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1605700282596 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ADD "input_data" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ADD "hook_id" integer`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" DROP COLUMN "hook_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" DROP COLUMN "input_data"`,
      undefined,
    );
  }
}

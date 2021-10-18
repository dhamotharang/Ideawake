import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1605084843192 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" DROP COLUMN "status"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "public"."hook_subscription_status_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ADD "status" boolean NOT NULL DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9794fa9190767557b6b7d7f39c" ON "hook_subscription" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d3c6eabb385e6ebeb534cbd10a" ON "hook_subscription" ("event", "community_id", "created_by") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc6e36b850159f1f6a0c7f4c31" ON "hook_subscription" ("event", "community_id") `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_dc6e36b850159f1f6a0c7f4c31"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_d3c6eabb385e6ebeb534cbd10a"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_9794fa9190767557b6b7d7f39c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" DROP COLUMN "status"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."hook_subscription_status_enum" AS ENUM('active', 'suspended')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ADD "status" "hook_subscription_status_enum" NOT NULL DEFAULT 'active'`,
      undefined,
    );
  }
}

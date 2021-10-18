import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1605857867253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_d3c6eabb385e6ebeb534cbd10a"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dc6e36b850159f1f6a0c7f4c31"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."hook_subscription_event_enum" RENAME TO "hook_subscription_event_enum_old"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "hook_subscription_event_enum" AS ENUM('new_opportunity', 'stage_change')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "event" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "event" TYPE "hook_subscription_event_enum" USING "event"::"text"::"hook_subscription_event_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "event" SET DEFAULT 'new_opportunity'`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "hook_subscription_event_enum_old"`,
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
      `CREATE TYPE "hook_subscription_event_enum_old" AS ENUM('new_opportunity')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "event" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "event" TYPE "hook_subscription_event_enum_old" USING "event"::"text"::"hook_subscription_event_enum_old"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "event" SET DEFAULT 'new_opportunity'`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "hook_subscription_event_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TYPE "hook_subscription_event_enum_old" RENAME TO  "hook_subscription_event_enum"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc6e36b850159f1f6a0c7f4c31" ON "hook_subscription" ("event", "community_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d3c6eabb385e6ebeb534cbd10a" ON "hook_subscription" ("created_by", "event", "community_id") `,
      undefined,
    );
  }
}

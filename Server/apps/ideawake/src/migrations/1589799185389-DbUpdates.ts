import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589799185389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "opportuiny_owners"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "opportuiny_teams"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "opportunity_submiters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportuiny_owners"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportuiny_teams"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportunity_submiters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "opportunity_owners" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "opportunity_teams" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "opportunity_submitters" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportunity_owners" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportunity_teams" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportunity_submitters" boolean NOT NULL DEFAULT true`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportunity_submitters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportunity_teams"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportunity_owners"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "opportunity_submitters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "opportunity_teams"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP COLUMN "opportunity_owners"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportunity_submiters" boolean NOT NULL DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportuiny_teams" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportuiny_owners" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "opportunity_submiters" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "opportuiny_teams" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD "opportuiny_owners" boolean NOT NULL DEFAULT false`,
      undefined,
    );
  }
}

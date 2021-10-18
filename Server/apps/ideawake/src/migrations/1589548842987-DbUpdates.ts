import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589548842987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.stage_notification_setting;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "stage_notification_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "notification_message"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "notifiable_individuals"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "notifiable_groups"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "send_notifcation_email"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "abbreviation"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "entity_object_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "groups" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "individuals" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportuiny_owners" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportuiny_teams" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "opportunity_submiters" boolean NOT NULL DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "followers" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "voters" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "send_email" boolean NOT NULL DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "community_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD CONSTRAINT "FK_6772ac7b25134332031a9c6f2a6" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD CONSTRAINT "FK_892e418540b8a92ead8c58cb50f" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP CONSTRAINT "FK_892e418540b8a92ead8c58cb50f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP CONSTRAINT "FK_6772ac7b25134332031a9c6f2a6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "community_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "send_email"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "voters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "followers"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportunity_submiters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportuiny_teams"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "opportuiny_owners"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "individuals"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "groups"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "entity_object_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "abbreviation" character varying(250) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "title" character varying(250) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "send_notifcation_email" boolean NOT NULL DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "notifiable_groups" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "notifiable_individuals" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "notification_message" character varying(2000)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "stage_notification_settings" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
  }
}

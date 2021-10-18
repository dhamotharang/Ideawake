import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589544207602 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "stage_assignment_settings_email_reminder_enum" AS ENUM('never', 'every_week', 'every_two_week', 'every_month')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "stage_assignment_settings" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" integer NOT NULL, "title" character varying(250) NOT NULL, "instructions" character varying(2000), "stage_time_limit" integer, "email_notification" boolean NOT NULL DEFAULT false, "email_reminder" "stage_assignment_settings_email_reminder_enum" NOT NULL DEFAULT 'never', "stage_comments" boolean NOT NULL DEFAULT true, "all_assignees_completed" boolean NOT NULL DEFAULT true, "minimum_responses" integer, "completion_time_limit" integer, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_203855e7faf3d6b750ad7ce2665" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" ADD CONSTRAINT "FK_10131f3ddfcc45961f8f35e7120" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" ADD CONSTRAINT "FK_382348689260d657f3656c47c94" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" DROP CONSTRAINT "FK_382348689260d657f3656c47c94"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" DROP CONSTRAINT "FK_10131f3ddfcc45961f8f35e7120"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "stage_assignment_settings"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "stage_assignment_settings_email_reminder_enum"`,
      undefined,
    );
  }
}

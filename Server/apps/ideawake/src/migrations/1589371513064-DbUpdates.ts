import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589371513064 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "stage_assignee_settings_settings_type_enum" AS ENUM('assignee', 'visibility')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "stage_assignee_settings" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "settings_type" "stage_assignee_settings_settings_type_enum" NOT NULL, "entity_object_id" integer, "unassigned" boolean NOT NULL DEFAULT true, "groups" integer array NOT NULL DEFAULT '{}', "individuals" integer array NOT NULL DEFAULT '{}', "community_admins" boolean NOT NULL DEFAULT false, "community_moderators" boolean NOT NULL DEFAULT false, "community_users" boolean NOT NULL DEFAULT false, "opportuiny_owners" boolean NOT NULL DEFAULT false, "opportuiny_teams" boolean NOT NULL DEFAULT false, "opportunity_submiters" boolean NOT NULL DEFAULT false, "all_members" boolean NOT NULL DEFAULT false, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_718a9f34a3a777fff84419dc212" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD CONSTRAINT "FK_92eaf2b42828b73b1fe9c35a01e" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ADD CONSTRAINT "FK_b742ef50a9ac22b9d647195854a" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP CONSTRAINT "FK_b742ef50a9ac22b9d647195854a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" DROP CONSTRAINT "FK_92eaf2b42828b73b1fe9c35a01e"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "stage_assignee_settings"`, undefined);
    await queryRunner.query(
      `DROP TYPE "stage_assignee_settings_settings_type_enum"`,
      undefined,
    );
  }
}

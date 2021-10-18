import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584709379633 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role" RENAME COLUMN "name" TO "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" RENAME CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" TO "UQ_4a74ca47fe1aa34a28a6db3c722"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "community_wise_permission" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "post_challenge" boolean DEFAULT false, "edit_challenge_details" boolean DEFAULT false, "edit_challenge_settings" boolean DEFAULT false, "edit_challenge_targetting" boolean DEFAULT false, "edit_challenge_phase_workflow" boolean DEFAULT false, "view_idea" boolean DEFAULT false, "edit_idea" boolean DEFAULT false, "edit_idea_settings" boolean DEFAULT false, "soft_delete_idea" boolean DEFAULT false, "change_idea_stage" boolean DEFAULT false, "change_idea_workflow" boolean DEFAULT false, "add_idea_owner" boolean DEFAULT false, "remove_idea_owner" boolean DEFAULT false, "add_idea_contributor" boolean DEFAULT false, "remove_idea_contributor" boolean DEFAULT false, "link_opportunities" boolean DEFAULT false, "merge_opportunities" boolean DEFAULT false, "vote_idea_in_challenge" boolean DEFAULT false, "follow_ideas_in_challenge" boolean DEFAULT false, "bookmark_ideas_in_challenge" boolean DEFAULT false, "share_ideas_in_challenge" boolean DEFAULT false, "post_comments_in_challenge" boolean DEFAULT false, "edit_comments_in_challenge" boolean DEFAULT false, "soft_delete_comments_in_challenge" boolean DEFAULT false, "mention_challenge_user_participants" boolean DEFAULT false, "mention_all_users_in_challenge" boolean DEFAULT false, "mention_challenge_group_participants" boolean DEFAULT false, "mention_all_groups_in_challenge" boolean DEFAULT false, "role_id" integer, "community_id" integer, CONSTRAINT "PK_c4397ce15f9c7edcae20593465c" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_experience_setting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "allow_voting" boolean DEFAULT false, "allow_commenting" boolean DEFAULT false, "allow_sharing" boolean DEFAULT false, "allow_anonymous_idea" boolean DEFAULT false, "allow_anonymous_comment" boolean DEFAULT false, "allow_anonymous_vote" boolean DEFAULT false, "default_anonymous_submissions" boolean DEFAULT false, "default_anonymous_comments" boolean DEFAULT false, "default_anonymous_votes" boolean DEFAULT false, "entity_object_id" integer NOT NULL, "role_id" integer, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_343b551bcbf210422c769ed9546" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD CONSTRAINT "FK_da11e2d33285f9fb2114724fe98" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD CONSTRAINT "FK_6b616d676c968545181f59e4850" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD CONSTRAINT "FK_1c83f900d695838ed8aee2e51d9" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD CONSTRAINT "FK_eae8cdb9b2dcee3a567070d0962" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD CONSTRAINT "FK_a892f36caaae183e20b26e443d1" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP CONSTRAINT "FK_a892f36caaae183e20b26e443d1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP CONSTRAINT "FK_eae8cdb9b2dcee3a567070d0962"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP CONSTRAINT "FK_1c83f900d695838ed8aee2e51d9"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP CONSTRAINT "FK_6b616d676c968545181f59e4850"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP CONSTRAINT "FK_da11e2d33285f9fb2114724fe98"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "entity_experience_setting"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "community_wise_permission"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" RENAME CONSTRAINT "UQ_4a74ca47fe1aa34a28a6db3c722" TO "UQ_ae4578dcaed5adff96595e61660"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" RENAME COLUMN "title" TO "name"`,
      undefined,
    );
  }
}

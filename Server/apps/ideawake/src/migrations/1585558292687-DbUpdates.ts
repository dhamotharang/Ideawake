import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585558292687 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `TRUNCATE public.community_wise_permission;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "soft_delete_comments_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_comments_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "post_comments_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "share_ideas_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "bookmark_ideas_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "follow_ideas_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "vote_idea_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "remove_idea_contributor"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_idea_contributor"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "remove_idea_owner"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_idea_owner"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "change_idea_workflow"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "change_idea_stage"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "soft_delete_idea"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_idea_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_idea"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "view_idea"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "access_basic_settings" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "access_appearance_settings" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "access_security_settings" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "access_integrations" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_scheduled_emails" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_communities" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_billing_and_plan" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "create_new_community" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "post_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "view_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_files_to_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_opportunity_settings" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "soft_delete_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "change_opportunity_stage" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "change_opportunity_workflow" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_opportunity_owner" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "remove_opportunity_owner" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_opportunity_contributor" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "remove_opportunity_contributor" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_opportunity_submitter" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "remove_opportunity_submitter" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "vote_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "follow_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "bookmark_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "share_opportunity" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "post_comments" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_comments" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "soft_delete_comments" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_users" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_groups" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "post_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "post_challenge" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_details"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_details" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_settings" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_targetting"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_targetting" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_phase_workflow"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_phase_workflow" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "link_opportunities"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "link_opportunities" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "merge_opportunities"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "merge_opportunities" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_challenge_user_participants"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_challenge_user_participants" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_all_users_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_all_users_in_challenge" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_challenge_group_participants"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_challenge_group_participants" integer DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_all_groups_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_all_groups_in_challenge" integer DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_all_groups_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_all_groups_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_challenge_group_participants"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_challenge_group_participants" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_all_users_in_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_all_users_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_challenge_user_participants"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "mention_challenge_user_participants" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "merge_opportunities"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "merge_opportunities" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "link_opportunities"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "link_opportunities" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_phase_workflow"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_phase_workflow" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_targetting"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_targetting" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_settings" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_challenge_details"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_challenge_details" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "post_challenge"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "post_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_groups"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "mention_users"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "soft_delete_comments"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_comments"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "post_comments"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "share_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "bookmark_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "follow_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "vote_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "remove_opportunity_submitter"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_opportunity_submitter"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "remove_opportunity_contributor"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_opportunity_contributor"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "remove_opportunity_owner"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_opportunity_owner"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "change_opportunity_workflow"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "change_opportunity_stage"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "soft_delete_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_opportunity_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "add_files_to_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "edit_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "view_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "post_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "create_new_community"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_billing_and_plan"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_communities"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_scheduled_emails"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "access_integrations"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "access_security_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "access_appearance_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "access_basic_settings"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "view_idea" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_idea" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_idea_settings" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "soft_delete_idea" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "change_idea_stage" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "change_idea_workflow" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_idea_owner" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "remove_idea_owner" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "add_idea_contributor" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "remove_idea_contributor" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "vote_idea_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "follow_ideas_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "bookmark_ideas_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "share_ideas_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "post_comments_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "edit_comments_in_challenge" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "soft_delete_comments_in_challenge" boolean DEFAULT false`,
      undefined,
    );
  }
}

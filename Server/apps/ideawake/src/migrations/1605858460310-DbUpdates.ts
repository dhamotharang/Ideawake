import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1605858460310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "action_item" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "action_type" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_type" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "theme" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "language" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_integration" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "circle" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_posting_experience" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_attachments" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_attachment" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "status" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_type" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_attachment" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_read_status" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_setting" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "email_template" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_type" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "following_content" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "mention" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "password_policy" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_category" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "shortcut" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_reference_mapping" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ALTER COLUMN "is_deleted" SET DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "vote" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_reference_mapping" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignment_settings" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_assignee_settings" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "shortcut" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_category" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "password_policy" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "mention" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "following_content" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_type" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "email_template" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_setting" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_read_status" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_attachment" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_type" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "status" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_attachment" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_attachments" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_posting_experience" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "circle" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_integration" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "language" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "theme" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_type" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "action_type" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "action_item" ALTER COLUMN "is_deleted" DROP DEFAULT`,
      undefined,
    );
  }
}

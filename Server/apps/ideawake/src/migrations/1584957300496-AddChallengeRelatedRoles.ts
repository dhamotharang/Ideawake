import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChallengeRelatedRoles1584957300496
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.role(
          title, description)
          VALUES ('Challenge Admin', 'Role For Challenge Administrator'),
          ('Challenge Moderator', 'Role For Challenge Moderator'),
          ('Challenge User', 'Role For Challenge User');`,
      undefined,
    );

    await queryRunner.query(
      `INSERT INTO public.community_wise_permission(
          post_challenge, edit_challenge_details, edit_challenge_settings, edit_challenge_targetting,
          edit_challenge_phase_workflow, view_idea, edit_idea, edit_idea_settings, soft_delete_idea,
          change_idea_stage, change_idea_workflow, add_idea_owner, remove_idea_owner, add_idea_contributor,
          remove_idea_contributor, link_opportunities, merge_opportunities, vote_idea_in_challenge,
          follow_ideas_in_challenge, bookmark_ideas_in_challenge, share_ideas_in_challenge,
          post_comments_in_challenge, edit_comments_in_challenge, soft_delete_comments_in_challenge,
          mention_challenge_user_participants, mention_all_users_in_challenge,
          mention_challenge_group_participants, mention_all_groups_in_challenge,
          role_id)
          VALUES (
            false, true, true, true, true, true, true, true, true, true, true, true, true,
            true, true, true, true, true, true, true, true, true, true, true, true, true, true,
            true, (SELECT id FROM public.role WHERE title = 'Challenge Admin')
          ), (
            false, true, true, true, true, true, true, true, true, true, true, true, true,
            true, true, true, true, true, true, true, true, true, true, true, true, true, true,
            true, (SELECT id FROM public.role WHERE title = 'Challenge Moderator')
          ),(
            false, false, false, false, false, true, true, false, false, false, false, false, false,
            false, false, true, false, true, true, true, true, true, true, true, true, false, false,
            false, (SELECT id FROM public.role WHERE title = 'Challenge User')
          );`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.community_wise_permission
        WHERE role_id IN (
          SELECT id FROM public.role WHERE title = 'Challenge Admin' OR title = 'Challenge Moderator' OR title = 'Challenge User'
        );`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.role WHERE title = 'Challenge Admin' OR title = 'Challenge Moderator' OR title = 'Challenge User';`,
      undefined,
    );
  }
}

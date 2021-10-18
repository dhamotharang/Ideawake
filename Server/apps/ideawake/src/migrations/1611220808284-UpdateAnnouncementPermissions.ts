import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAnnouncementPermissions1611220808284
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_announcement=2, manage_announcement=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
            OR r.abbreviation = 'challenge_admin' OR r.abbreviation = 'challenge_moderator'
            OR r.abbreviation = 'opportunity_owner' OR r.abbreviation = 'opportunity_contributor'
        )`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_announcement=1
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'user' OR r.abbreviation = 'challenge_user'
            OR r.abbreviation = 'opportunity_submitter'
        )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_announcement=0, manage_announcement=0`,
      undefined,
    );
  }
}

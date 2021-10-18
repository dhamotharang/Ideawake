import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMentionPermissions1600430022180
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission SET mention_challenge_users=2`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET mention_challenge_groups=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
            OR r.abbreviation = 'challenge_admin'
            OR r.abbreviation = 'challenge_moderator'
        )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET mention_challenge_users=0, mention_challenge_groups=0`,
      undefined,
    );
  }
}

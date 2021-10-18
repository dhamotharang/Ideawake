import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewChallengePermToExistingRoles1595945872811
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
          SET view_challenge=2
          WHERE role_id IN (
            SELECT id FROM public.role as r
            WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
              OR r.abbreviation = 'challenge_admin' OR r.abbreviation = 'challenge_moderator'
              OR r.abbreviation = 'challenge_user'
          )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_challenge=1`,
      undefined,
    );
  }
}

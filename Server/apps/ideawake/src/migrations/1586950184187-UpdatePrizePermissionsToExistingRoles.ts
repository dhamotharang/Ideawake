import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePrizePermissionsToExistingRoles1586950184187
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
          SET manage_prize=2, award_prize=2
          WHERE role_id IN (
            SELECT id FROM public.role as r
            WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator' OR r.abbreviation = 'challenge_admin' OR r.abbreviation = 'challenge_moderator'
          )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
          SET manage_prize=0, award_prize=0
          WHERE role_id IN (
            SELECT id FROM public.role as r
            WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator' OR r.abbreviation = 'challenge_admin' OR r.abbreviation = 'challenge_moderator'
          )`,
      undefined,
    );
  }
}

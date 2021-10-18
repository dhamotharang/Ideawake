import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManagementPermissionsToExistingRoles1597142320914
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET manage_user_roles=2, archive_user=2, manage_opportunity_types=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin'
        )`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET manage_user_roles=1, manage_opportunity_types=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'moderator'
        )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET manage_user_roles=0, archive_user=0, manage_opportunity_types=0`,
      undefined,
    );
  }
}

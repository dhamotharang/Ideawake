import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomFieldPermissionsToExistingRoles1597231592565
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET access_custom_field_settings=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
        )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET access_custom_field_settings=0
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
        )`,
      undefined,
    );
  }
}

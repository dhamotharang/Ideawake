import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomFieldPermissionsToExistingRoles1591963771899
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
            SET create_custom_field=2, edit_custom_field=2, edit_custom_field_options=2, soft_delete_custom_field=2, edit_custom_field_data=2, view_custom_field_data=2
            WHERE role_id IN (
              SELECT id FROM public.role as r
              WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
            )`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.community_wise_permission
            SET create_custom_field=0, edit_custom_field=0, edit_custom_field_options=0, soft_delete_custom_field=0, edit_custom_field_data=1, view_custom_field_data=1
            WHERE role_id IN (
              SELECT id FROM public.role as r
              WHERE r.abbreviation != 'admin' AND r.abbreviation != 'moderator'
            )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
          SET create_custom_field=0, edit_custom_field=0, edit_custom_field_options=0, soft_delete_custom_field=0, edit_custom_field_data=0, view_custom_field_data=0`,
      undefined,
    );
  }
}

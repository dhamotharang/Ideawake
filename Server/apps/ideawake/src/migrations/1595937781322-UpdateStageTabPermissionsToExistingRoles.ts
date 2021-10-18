import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStageTabPermissionsToExistingRoles1595937781322
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_stage_specific_tab=2
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
        SET view_stage_specific_tab=1`,
      undefined,
    );
  }
}

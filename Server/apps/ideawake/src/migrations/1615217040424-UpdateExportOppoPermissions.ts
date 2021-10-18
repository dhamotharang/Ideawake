import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateExportOppoPermissions1615217040424
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET export_opportunity=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
            OR r.abbreviation = 'challenge_admin' OR r.abbreviation = 'challenge_moderator'
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission SET export_opportunity=0`,
    );
  }
}

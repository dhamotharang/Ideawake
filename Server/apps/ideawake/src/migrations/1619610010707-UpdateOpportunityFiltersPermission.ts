import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOpportunityFiltersPermission1619610010707
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
                    SET manage_opportunity_filters=2
                    WHERE role_id IN (
                      SELECT id FROM public.role as r
                      WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
                    )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission SET manage_opportunity_filters=0`,
    );
  }
}

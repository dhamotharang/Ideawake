import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBookmarkedViewPermissions1601646737317
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_bookmarked_view=2, manage_bookmarked_view=2
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'admin' OR r.abbreviation = 'moderator'
        )`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_bookmarked_view=1, manage_bookmarked_view=1
        WHERE role_id IN (
          SELECT id FROM public.role as r
          WHERE r.abbreviation = 'user'
        )`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community_wise_permission
        SET view_bookmarked_view=0, manage_bookmarked_view=0`,
      undefined,
    );
  }
}

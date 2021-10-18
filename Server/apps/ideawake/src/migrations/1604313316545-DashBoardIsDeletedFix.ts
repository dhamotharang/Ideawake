import { MigrationInterface, QueryRunner } from 'typeorm';

export class DashBoardIsDeletedFix1604313316545 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.dashboard SET is_deleted = false WHERE is_deleted ISNULL`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.widget SET is_deleted = false WHERE is_deleted ISNULL`,
      undefined,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    // There's no going back!
  }
}

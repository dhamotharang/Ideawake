import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArchiveVotingStageTool1598962882536 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.action_item
        SET is_deleted = false;`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.action_item
        SET is_deleted = true
        WHERE abbreviation = 'voting';`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.action_item
        SET is_deleted = false;`,
      undefined,
    );
  }
}

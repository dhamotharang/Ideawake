import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNoToolActionName1598964061656 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.action_item
          SET title = 'No Action'
          WHERE abbreviation = 'no_tool';`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.action_item
          SET title = 'No Tool'
          WHERE abbreviation = 'no_tool';`,
      undefined,
    );
  }
}

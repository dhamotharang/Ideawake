import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoToolToExistingStages1589797363524
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.stage
        SET action_item_id = (
          SELECT id FROM public.action_item WHERE abbreviation='no_tool'
        );`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.stage SET action_item_id = null`,
      undefined,
    );
  }
}

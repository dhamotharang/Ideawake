import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingStatusesInStageHistory1603718126743
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.stage_history history
        SET status_id = stg.status_id
        FROM public.stage stg
        WHERE stg.id = history.stage_id AND history.status_id ISNULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.stage_history
        SET status_id = null`,
      undefined,
    );
  }
}

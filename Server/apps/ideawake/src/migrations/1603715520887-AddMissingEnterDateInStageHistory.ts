import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingEnterDateInStageHistory1603715520887
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.stage_history hist
        SET entering_at = hist.exiting_at
        WHERE entering_at ISNULL`,
      undefined,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    // There's no going back!
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStageActionTypes1599218785204 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_type(id, name, abbreviation)
        VALUES (20, 'AddWorkflow', 'add_workflow'),
        (21, 'ChangeWorkflow', 'change_workflow'),
        (22, 'ChangeStage', 'change_stage');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.action_type
        WHERE abbreviation = 'add_workflow' OR abbreviation = 'change_workflow'
          OR abbreviation = 'change_stage';`,
      undefined,
    );
  }
}

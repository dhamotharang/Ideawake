import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDecisionActionItem1594973371410
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.stage s
        SET action_item_id = (
          SELECT id FROM public.action_item inner_ai
          WHERE inner_ai.abbreviation = 'scorecard'
        )
        FROM public.action_item ai
        WHERE ai.id = s.action_item_id AND ai.abbreviation = 'decision_question_poll'`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_item
        WHERE abbreviation = 'decision_question_poll';`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_item(title, description, abbreviation)
        VALUES ('Decision / Question / Poll', 'Decision / Question / Poll', 'decision_question_poll');`,
      undefined,
    );
  }
}

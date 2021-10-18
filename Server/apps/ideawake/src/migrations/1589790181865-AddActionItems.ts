import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActionItems1589790181865 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_item(title, description, abbreviation)
        VALUES ('No Tool', 'No Tool', 'no_tool'),
        ('Refinement', 'Refinement', 'refinement'),
        ('Voting', 'Voting', 'voting'),
        ('Scorecard', 'Scorecard', 'scorecard'),
        ('Decision / Question / Poll', 'Decision / Question / Poll', 'decision_question_poll');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DELETE FROM public.action_item;`, undefined);
  }
}

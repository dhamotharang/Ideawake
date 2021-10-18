import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEvaluationTypes1594273144606 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.evaluation_type(
          title, description, icon, color, abbreviation)
                  VALUES ('Question or Scorecard Criteria', 'This is the description of a scorecard this is the description of a scorecard this is the description of a scorecard.', 'question-circle', '#17A2B8', 'question');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.evaluation_type(
            title, description, icon, color, abbreviation)
                    VALUES ('Numerical Range', 'This is the description of a scorecard this is the description of a scorecard this is the description of a scorecard.', 'tally', '#727CF5', 'numerical_range');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.evaluation_type where abbreviation = 'question';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.evaluation_type where abbreviation = 'numerical_range';`,
      undefined,
    );
  }
}

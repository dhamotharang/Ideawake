import { MigrationInterface, QueryRunner } from 'typeorm';
import { EVALUATION_TYPE_ABBREVIATIONS } from '../common/constants/constants';

export class UpdateCriteriaTypeDesc1613751662381 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE "evaluation_type"
        SET title='Scorecard Criteria',
        description='Provide pre-defined options for reviewers to respond to. Examples include complexity to implement, strategic alignment, and impact on customer experience.',
        example_image_url='https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/question-example.png'
        WHERE abbreviation='${EVALUATION_TYPE_ABBREVIATIONS.QUESTION}'`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE "evaluation_type"
        SET title='Numerical Range',
        description='Ask reviewers to forecast a number related to submissions being evaluated. Examples include projected revenue, projected savings, and cost to implement.',
        example_image_url='https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/numeric-example.png'
        WHERE abbreviation='${EVALUATION_TYPE_ABBREVIATIONS.NUMBER}'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE "evaluation_type"
        SET title='Question or Scorecard Criteria',
        description='This is the description of a scorecard this is the description of a scorecard this is the description of a scorecard.',
        example_image_url=null
        WHERE abbreviation='${EVALUATION_TYPE_ABBREVIATIONS.QUESTION}'`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE "evaluation_type"
        SET title='Numerical Range',
        description='This is the description of a scorecard this is the description of a scorecard this is the description of a scorecard.',
        example_image_url=null
        WHERE abbreviation='${EVALUATION_TYPE_ABBREVIATIONS.NUMBER}'`,
      undefined,
    );
  }
}

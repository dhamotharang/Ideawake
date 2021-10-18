import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpportunityTypes1581426601256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.opportunity_type(
          name, description, icon, color, is_enabled, type_id)
          VALUES ('Idea', 'Idea', '', '', true, 'idea');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.opportunity_type where type_id = 'idea';`,
      undefined,
    );
  }
}

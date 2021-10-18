import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpportunityTypeEntityType1586259956832
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(
              name, abbreviation, entity_code, entity_table)
              VALUES ('opportunity_type', 'opportunity_type', 'opportunity_type', 'opportunity_type');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.entity_type WHERE abbreviation='opportunity_type';`,
      undefined,
    );
  }
}

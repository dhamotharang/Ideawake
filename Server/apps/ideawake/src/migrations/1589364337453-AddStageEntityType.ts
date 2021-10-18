import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStageEntityType1589364337453 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(
                name, abbreviation, entity_code, entity_table)
                VALUES ('stage', 'stage', 'stage', 'stage');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.entity_type WHERE abbreviation='stage';`,
      undefined,
    );
  }
}

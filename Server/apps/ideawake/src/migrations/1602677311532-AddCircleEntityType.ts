import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCircleEntityType1602677311532 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(
                name, abbreviation, entity_code, entity_table)
                VALUES ('circle', 'circle', 'circle', 'circle')`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `TRUNCATE public.entity_type where abbreviation='circle';`,
      undefined,
    );
  }
}

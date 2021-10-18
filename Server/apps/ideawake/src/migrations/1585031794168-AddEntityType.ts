import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityType1585031794168 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(
              name, abbreviation, entity_code, entity_table)
              VALUES ('idea', 'idea', 'idea', 'opportunity'),
              ('user', 'user', 'user', 'user'),
              ('comment', 'comment', 'comment', 'comment'),
              ('challenge', 'challenge', 'challenge', 'challenge');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`TRUNCATE public.entity_type CASCADE;`, undefined);
  }
}

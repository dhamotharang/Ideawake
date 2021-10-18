import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoteEntityType1609328676770 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(
                    name, abbreviation, entity_code, entity_table)
                    VALUES ('vote', 'vote', 'vote', 'vote'),
                    ('invite', 'invite', 'invite', 'invite');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.entity_type WHERE abbreviation='vote' OR abbreviation='invite';`,
      undefined,
    );
  }
}

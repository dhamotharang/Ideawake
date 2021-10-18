import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnouncementEntityType1611066845816
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(name, abbreviation, entity_code, entity_table)
        VALUES ('announcement', 'announcement', 'announcement', 'announcement');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.entity_type WHERE abbreviation='announcement';`,
    );
  }
}

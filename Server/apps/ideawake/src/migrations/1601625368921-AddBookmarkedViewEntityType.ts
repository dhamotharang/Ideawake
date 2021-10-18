import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookmarkedViewEntityType1601625368921
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_type(
        name, abbreviation, entity_code, entity_table)
        VALUES ('bookmarked_view', 'bookmarked_view', 'bookmarked_view', 'bookmarked_view');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.entity_type WHERE abbreviation='bookmarked_view';`,
      undefined,
    );
  }
}

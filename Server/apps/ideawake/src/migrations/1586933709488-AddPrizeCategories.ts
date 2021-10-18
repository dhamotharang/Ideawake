import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrizeCategories1586933709488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.prize_category(
                title, abbreviation)
                VALUES ('Things', 'things'),
                ('Money', 'money'),
                ('Experiences', 'experiences'),
                ('Other', 'other');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `TRUNCATE public.prize_category CASCADE;`,
      undefined,
    );
  }
}

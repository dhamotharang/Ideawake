import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFieldTypes1608801268106 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.custom_field_type SET title = 'User or Group', abbreviation = 'user_or_group' WHERE abbreviation='community_user_or_group';`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.custom_field_type SET title = 'Community User or Group', abbreviation = 'community_user_or_group' WHERE abbreviation='user_or_group';`,
      undefined,
    );
  }
}

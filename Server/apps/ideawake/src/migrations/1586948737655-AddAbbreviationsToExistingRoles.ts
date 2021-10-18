import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAbbreviationsToExistingRoles1586948737655
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.role
        SET abbreviation=replace(trim(both '_' from lower(regexp_replace(regexp_replace(title, '([A-Z])','_\\1', 'g'), '( [a-z])','_\\1', 'g'))), ' ', '')`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.role
        SET abbreviation=null`,
      undefined,
    );
  }
}

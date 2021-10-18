import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomFielTypes1595395067990 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.custom_field_type cf
        SET is_deleted = false`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.custom_field_type cf
        SET is_deleted = true
        WHERE cf.abbreviation IN ('projected_benefits',
        'projected_costs',
        'actual_benefits',
        'actual_costs',
        'user_skills_tags',
        'calculated_field')`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.custom_field_type cf
        SET is_deleted = false
        WHERE cf.abbreviation IN ('projected_benefits',
        'projected_costs',
        'actual_benefits',
        'actual_costs',
        'user_skills_tags',
        'calculated_field')`,
      undefined,
    );
  }
}

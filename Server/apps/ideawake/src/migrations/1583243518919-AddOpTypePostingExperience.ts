import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpTypePostingExperience1583243518919
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.opportunity_type_posting_experience(name)
            VALUES ('In Posting Form'), ('In Create Dropdown'), ('In Challenges Only');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.opportunity_type where name IN ('In Posting Form', 'In Create Dropdown', 'In Challenges Only');`,
      undefined,
    );
  }
}

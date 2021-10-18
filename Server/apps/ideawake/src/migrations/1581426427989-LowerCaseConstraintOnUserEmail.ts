import { MigrationInterface, QueryRunner } from 'typeorm';

export class LowerCaseConstraintOnUserEmail1581426427989
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE public.user
    ADD CONSTRAINT email_lowercase_check
    check (email = lower(email))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE public.user DROP CONSTRAINT email_lowercase_check;`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActionTypes1588851416171 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_type(
                                id,name, abbreviation)
                                VALUES (18,'InviteUser', 'invite_user');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
                                id,name, abbreviation)
                                VALUES (19,'ForgotPassword', 'forgot_password');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'InviteUser';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'ForgotPassword';`,
      undefined,
    );
  }
}

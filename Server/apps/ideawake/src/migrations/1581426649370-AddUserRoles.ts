import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoles1581426649370 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.role(
        name, description)
        VALUES ('Admin', 'Role For Administrator');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.role(
        name, description)
        VALUES ('User', 'Role For User');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.role(
        name, description)
        VALUES ('Moderator', 'Role For Moderator');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.role where name = 'Admin';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.role where name = 'User';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.role where name = 'Moderator';`,
      undefined,
    );
  }
}

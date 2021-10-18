import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActionTypes1586169434717 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (11,'AddOwner', 'add_owner');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (12,'RemoveOwner', 'remove_owner');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (13,'AddContributor', 'add_contributor');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (14,'RemoveContributor', 'remove_contributor');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (15,'AddSubmitter', 'add_submitter');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (16,'RemoveSubmitter', 'remove_submitter');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'AddOwner';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'RemoveOwner';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'AddContributor';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'RemoveContributor';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'AddSubmitter';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'RemoveSubmitter';`,
      undefined,
    );
  }
}

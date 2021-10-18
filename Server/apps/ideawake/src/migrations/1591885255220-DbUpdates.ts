import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1591885255220 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "edit_roles_text" character varying(250) NOT NULL DEFAULT 'Public'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD "visibility_roles_text" character varying(250) NOT NULL DEFAULT 'Public'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "visibility_roles_text"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP COLUMN "edit_roles_text"`,
      undefined,
    );
  }
}

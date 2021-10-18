import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1599751948732 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "sso_url"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" ADD "sso_url" character varying(2048)`,
      undefined,
    );
  }
}

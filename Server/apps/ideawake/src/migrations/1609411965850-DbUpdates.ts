import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1609411965850 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "old_password" character varying(300)`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "old_password"`,
      undefined,
    );
  }
}

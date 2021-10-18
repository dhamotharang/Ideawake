import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1599728612680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "is_sso"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_sso"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_sso" boolean NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD "is_sso" boolean NOT NULL`,
      undefined,
    );
  }
}

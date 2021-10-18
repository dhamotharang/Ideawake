import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597825215238 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" ADD "refresh_token" text`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" DROP COLUMN "refresh_token"`,
      undefined,
    );
  }
}

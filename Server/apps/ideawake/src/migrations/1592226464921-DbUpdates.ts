import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1592226464921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `TRUNCATE TABLE "custom_field" CASCADE;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD CONSTRAINT "UQ_92d7012572667feb7941a3292ab" UNIQUE ("unique_id", "community_id")`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP CONSTRAINT "UQ_92d7012572667feb7941a3292ab"`,
      undefined,
    );
  }
}

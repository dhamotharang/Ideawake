import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1610355148851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "community_default_language_enum" AS ENUM('en', 'itl', 'fr', 'es', 'pt', 'ar', 'de')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD "default_language" "community_default_language_enum" NOT NULL DEFAULT 'en'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "default_language"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "community_default_language_enum"`,
      undefined,
    );
  }
}

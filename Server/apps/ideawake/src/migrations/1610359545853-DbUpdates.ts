import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1610359545853 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "user_language_enum" AS ENUM('en', 'itl', 'fr', 'es', 'pt', 'ar', 'de')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "language" "user_language_enum" NOT NULL DEFAULT 'en'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "language"`,
      undefined,
    );
    await queryRunner.query(`DROP TYPE "user_language_enum"`, undefined);
  }
}

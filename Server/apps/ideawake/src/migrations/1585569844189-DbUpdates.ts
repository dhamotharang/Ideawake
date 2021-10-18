import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585569844189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`TRUNCATE public.role CASCADE;`, undefined);
    await queryRunner.query(
      `CREATE TYPE "role_level_enum" AS ENUM('community', 'challenge', 'group', 'opportunity')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD "level" "role_level_enum" NOT NULL DEFAULT 'community'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "UQ_4a74ca47fe1aa34a28a6db3c722"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "UQ_4a74ca47fe1aa34a28a6db3c722" UNIQUE ("title")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP COLUMN "level"`,
      undefined,
    );
    await queryRunner.query(`DROP TYPE "role_level_enum"`, undefined);
  }
}

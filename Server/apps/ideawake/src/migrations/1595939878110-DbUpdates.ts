import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1595939878110 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "alert_message" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."entity_experience_setting_default_sort_enum" RENAME TO "entity_experience_setting_default_sort_enum_old"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "entity_experience_setting_default_sort_enum" AS ENUM('newest', 'oldest', 'random', 'most_votes', 'most_comments')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_sort" TYPE "entity_experience_setting_default_sort_enum" USING "default_sort"::"text"::"entity_experience_setting_default_sort_enum"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "entity_experience_setting_default_sort_enum_old"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "entity_experience_setting_default_sort_enum_old" AS ENUM('newest', 'random', 'most_votes')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_sort" TYPE "entity_experience_setting_default_sort_enum_old" USING "default_sort"::"text"::"entity_experience_setting_default_sort_enum_old"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "entity_experience_setting_default_sort_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TYPE "entity_experience_setting_default_sort_enum_old" RENAME TO  "entity_experience_setting_default_sort_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "alert_message"`,
      undefined,
    );
  }
}

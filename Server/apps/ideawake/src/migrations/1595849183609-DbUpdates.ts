import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1595849183609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_team_based_opportunity_submission"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "challenge_status_enum" AS ENUM('open', 'evaluation', 'closed')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "status" "challenge_status_enum" NOT NULL DEFAULT 'open'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_team_based_opportunity" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_submissions" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "display_alert" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "entity_experience_setting_default_sort_enum" AS ENUM('newest', 'random', 'most_votes')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "default_sort" "entity_experience_setting_default_sort_enum"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "default_sort"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "entity_experience_setting_default_sort_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "display_alert"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_submissions"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_team_based_opportunity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "status"`,
      undefined,
    );
    await queryRunner.query(`DROP TYPE "challenge_status_enum"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_team_based_opportunity_submission" boolean DEFAULT false`,
      undefined,
    );
  }
}

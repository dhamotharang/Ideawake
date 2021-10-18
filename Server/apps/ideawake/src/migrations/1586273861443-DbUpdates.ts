import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1586273861443 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_opportunity_ownership" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "assign_opportunity_submitter_as_owner" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_opportunity_teams" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_team_based_opportunity_submission" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "assign_opportunity_submitter_as_contributor" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "assign_merged_contributors_to_parent" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "allow_opportunity_cosubmitters" boolean DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "assign_merged_cosubmitters_to_parent" boolean DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "assign_merged_cosubmitters_to_parent"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_opportunity_cosubmitters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "assign_merged_contributors_to_parent"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "assign_opportunity_submitter_as_contributor"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_team_based_opportunity_submission"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_opportunity_teams"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "assign_opportunity_submitter_as_owner"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "allow_opportunity_ownership"`,
      undefined,
    );
  }
}

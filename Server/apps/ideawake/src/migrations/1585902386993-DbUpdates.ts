import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585902386993 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_voting" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_commenting" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_sharing" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_anonymous_idea" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_anonymous_comment" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_anonymous_vote" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_anonymous_submissions" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_anonymous_comments" SET DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_anonymous_votes" SET DEFAULT true`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_anonymous_votes" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_anonymous_comments" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "default_anonymous_submissions" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_anonymous_vote" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_anonymous_comment" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_anonymous_idea" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_sharing" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_commenting" SET DEFAULT false`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ALTER COLUMN "allow_voting" SET DEFAULT false`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584109118409 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" DROP COLUMN "participant_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" ADD "participant_id" integer NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "tags"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "tags" integer array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "sponsors"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "sponsors" integer array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "moderators"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "moderators" integer array`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "moderators"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "moderators" numeric array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "sponsors"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "sponsors" numeric array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "tags"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "tags" numeric array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" DROP COLUMN "participant_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" ADD "participant_id" numeric NOT NULL`,
      undefined,
    );
  }
}

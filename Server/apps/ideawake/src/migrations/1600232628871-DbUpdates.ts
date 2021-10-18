import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1600232628871 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" ADD "community_slug" text`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "community_slug"`,
      undefined,
    );
  }
}

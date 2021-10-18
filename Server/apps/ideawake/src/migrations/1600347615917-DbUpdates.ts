import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1600347615917 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_jumbotron" smallint NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_jumbotron"`,
      undefined,
    );
  }
}

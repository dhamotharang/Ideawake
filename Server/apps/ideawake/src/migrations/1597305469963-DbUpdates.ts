import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597305469963 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" ADD "token" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "refresh_token" text`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "refresh_token"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" DROP COLUMN "token"`,
      undefined,
    );
  }
}

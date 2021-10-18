import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1596697191208 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" ADD "is_deleted" boolean DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" DROP COLUMN "is_deleted"`,
      undefined,
    );
  }
}

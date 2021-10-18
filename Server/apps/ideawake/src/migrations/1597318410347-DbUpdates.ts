import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597318410347 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" DROP COLUMN "role"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_communities_community_role_enum"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`, undefined);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('Admin', 'Moderator', 'User')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "user_role_enum" NOT NULL DEFAULT 'User'`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_communities_community_role_enum" AS ENUM('Admin', 'Moderator', 'User')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" ADD "role" "user_communities_community_role_enum" NOT NULL DEFAULT 'User'`,
      undefined,
    );
  }
}

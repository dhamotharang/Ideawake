import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585646912677 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "invite" RENAME COLUMN "role" TO "role_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."invite_role_enum" RENAME TO "invite_role_id_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP COLUMN "role_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD "role_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_2c927383dc1d7467f93f926d50c" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_2c927383dc1d7467f93f926d50c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP COLUMN "role_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD "role_id" "invite_role_id_enum" NOT NULL DEFAULT 'User'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TYPE "invite_role_id_enum" RENAME TO "invite_role_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" RENAME COLUMN "role_id" TO "role"`,
      undefined,
    );
  }
}

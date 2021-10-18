import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1586879126221 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "prize_category" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "abbreviation" character varying(250) NOT NULL, CONSTRAINT "PK_cd0e2ec85f1cb9e89ae2244f3cb" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "prize" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" character varying(2000), "image" character varying(2000), "total_winners" bigint NOT NULL DEFAULT 0, "prize_value" bigint, "is_redeemable" boolean NOT NULL DEFAULT false, "redeem_points" bigint NOT NULL DEFAULT 0, "challenge_id" integer, "category_id" integer, "community_id" integer, CONSTRAINT "PK_ed6e4960a2fb62a3fa2025074fb" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_975b19366975001d0b5155b3021" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_cd0e2ec85f1cb9e89ae2244f3cb" FOREIGN KEY ("category_id") REFERENCES "prize_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_367cffa222294e367a84495f302" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_367cffa222294e367a84495f302"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_cd0e2ec85f1cb9e89ae2244f3cb"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_975b19366975001d0b5155b3021"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "prize"`, undefined);
    await queryRunner.query(`DROP TABLE "prize_category"`, undefined);
  }
}

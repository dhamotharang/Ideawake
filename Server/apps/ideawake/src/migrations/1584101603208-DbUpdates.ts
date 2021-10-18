import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584101603208 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "challenge_participant_type_enum" AS ENUM('User', 'Group')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "challenge_participant" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "participant_id" numeric NOT NULL, "type" "challenge_participant_type_enum" NOT NULL DEFAULT 'User', "challenge_id" integer, CONSTRAINT "PK_eee6a72b59b11a4dc11c1721ff1" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "name"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "title" character varying(256) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "description" character varying(2000)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "banner_image" character varying(2000)`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "draft" boolean DEFAULT true`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "tags" numeric array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "sponsors" numeric array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "moderators" numeric array`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "opportunity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "community_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" ADD CONSTRAINT "FK_384da6e1bb4eeb543f1e0c894cc" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_101c9ed867249a99c03f8e76a0f" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_eeb4f6a1826ab16de1b9d3ff56c" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_eeb4f6a1826ab16de1b9d3ff56c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_101c9ed867249a99c03f8e76a0f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participant" DROP CONSTRAINT "FK_384da6e1bb4eeb543f1e0c894cc"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "community_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "opportunity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "moderators"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "sponsors"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "tags"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "draft"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "banner_image"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "description"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "title"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "name" character varying(250) NOT NULL`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "challenge_participant"`, undefined);
    await queryRunner.query(
      `DROP TYPE "challenge_participant_type_enum"`,
      undefined,
    );
  }
}

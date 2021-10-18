import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1601625202464 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "bookmarked_view_view_type_enum" AS ENUM('card', 'table')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "bookmarked_view" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "bookmarked_url" text NOT NULL, "view_type" "bookmarked_view_view_type_enum" NOT NULL DEFAULT 'table', "is_default" boolean NOT NULL DEFAULT false, "user_id" integer, "community_id" integer, CONSTRAINT "PK_f456e88b8d315af2ce08f07550f" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" ADD CONSTRAINT "FK_0b447b65d0e0ea63511b133672f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" ADD CONSTRAINT "FK_b6393a197b6eed2620faf3fd612" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" DROP CONSTRAINT "FK_b6393a197b6eed2620faf3fd612"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarked_view" DROP CONSTRAINT "FK_0b447b65d0e0ea63511b133672f"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "bookmarked_view"`, undefined);
    await queryRunner.query(
      `DROP TYPE "bookmarked_view_view_type_enum"`,
      undefined,
    );
  }
}

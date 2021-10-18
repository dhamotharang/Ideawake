import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1618911090365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "column_option_page_type_enum" AS ENUM('table', 'card', 'challenge')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "column_option" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "page_type" "column_option_page_type_enum" NOT NULL DEFAULT 'card', "options_data" json, "community_id" integer, CONSTRAINT "PK_88b625fa48f86b6d172dc479c56" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87c388a9cbdbdd11078b281e75" ON "column_option" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "column_option" ADD CONSTRAINT "FK_87c388a9cbdbdd11078b281e756" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "column_option" DROP CONSTRAINT "FK_87c388a9cbdbdd11078b281e756"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_87c388a9cbdbdd11078b281e75"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "column_option"`, undefined);
    await queryRunner.query(
      `DROP TYPE "column_option_page_type_enum"`,
      undefined,
    );
  }
}

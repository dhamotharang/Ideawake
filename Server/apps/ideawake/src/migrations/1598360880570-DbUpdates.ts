import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1598360880570 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "filter_option_page_type_enum" AS ENUM('table', 'card', 'challenge')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "filter_option" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "page_type" "filter_option_page_type_enum" NOT NULL DEFAULT 'card', "options_data" json, "user_id" integer, "community_id" integer, CONSTRAINT "PK_b6f845265fa60a685193e112f7f" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d26d06a62e2fdb5eebe74051c" ON "filter_option" ("user_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f9dee423877e96269fce403ef" ON "filter_option" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" ADD CONSTRAINT "FK_9d26d06a62e2fdb5eebe74051cb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" ADD CONSTRAINT "FK_1f9dee423877e96269fce403efb" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "filter_option" DROP CONSTRAINT "FK_1f9dee423877e96269fce403efb"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" DROP CONSTRAINT "FK_9d26d06a62e2fdb5eebe74051cb"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_1f9dee423877e96269fce403ef"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_9d26d06a62e2fdb5eebe74051c"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "filter_option"`, undefined);
    await queryRunner.query(
      `DROP TYPE "filter_option_page_type_enum"`,
      undefined,
    );
  }
}

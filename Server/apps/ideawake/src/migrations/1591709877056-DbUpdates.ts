import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1591709877056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "custom_field_type_category_enum" AS ENUM('user_fields', 'collect_information', 'choosing', 'benefits_costs_and_resources', 'values', 'uploads')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_field_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "abbreviation" character varying(250) NOT NULL, "description" character varying(250) NOT NULL, "category" "custom_field_type_category_enum" NOT NULL DEFAULT 'user_fields', "icon" character varying(250) NOT NULL, CONSTRAINT "PK_ca707707770a239b0e4f765ed46" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "custom_field_type"`, undefined);
    await queryRunner.query(
      `DROP TYPE "custom_field_type_category_enum"`,
      undefined,
    );
  }
}

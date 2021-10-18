import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1591782397217 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "custom_field" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" character varying(2000), "placeholder_text" character varying(2000), "unique_id" character varying(250) NOT NULL, "field_data_object" text, "is_required" boolean NOT NULL DEFAULT false, "edit_roles" integer array DEFAULT '{}', "visibility_roles" integer array DEFAULT '{}', "custom_field_type_id" integer, "community_id" integer, CONSTRAINT "PK_70c7eb2dfb5b81c051a6ba3ace8" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD CONSTRAINT "FK_9976bfa47fb12c52a3e4efd3223" FOREIGN KEY ("custom_field_type_id") REFERENCES "custom_field_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" ADD CONSTRAINT "FK_ea3686408afc529dd54529bacfa" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP CONSTRAINT "FK_ea3686408afc529dd54529bacfa"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field" DROP CONSTRAINT "FK_9976bfa47fb12c52a3e4efd3223"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "custom_field"`, undefined);
  }
}

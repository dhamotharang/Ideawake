import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1593012140449 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "custom_field_integration_visibility_experience_enum" AS ENUM('submission_form', 'opportunity_container', 'refinement_tab')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_field_integration" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" integer NOT NULL, "order" integer, "visibility_experience" "custom_field_integration_visibility_experience_enum", "entity_type_id" integer, "field_id" integer, "community_id" integer, CONSTRAINT "PK_2190966958e928012cab215e18d" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" ADD CONSTRAINT "FK_729574feb5003889482177ef357" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" ADD CONSTRAINT "FK_74a9cd14085d6d1043cbe42e013" FOREIGN KEY ("field_id") REFERENCES "custom_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" ADD CONSTRAINT "FK_21441a4ff988d793e7f74116587" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" DROP CONSTRAINT "FK_21441a4ff988d793e7f74116587"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" DROP CONSTRAINT "FK_74a9cd14085d6d1043cbe42e013"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_integration" DROP CONSTRAINT "FK_729574feb5003889482177ef357"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "custom_field_integration"`, undefined);
    await queryRunner.query(
      `DROP TYPE "custom_field_integration_visibility_experience_enum"`,
      undefined,
    );
  }
}

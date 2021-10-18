import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1593076881275 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "custom_field_data" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "field_data" json NOT NULL, "history" json, "field_id" integer, "opportunity_id" integer, "stage_id" integer, "community_id" integer, CONSTRAINT "PK_678eb006ee27489ea23e2d81e40" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ADD CONSTRAINT "FK_5f3edd0ed96b585b26ffb669e40" FOREIGN KEY ("field_id") REFERENCES "custom_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ADD CONSTRAINT "FK_2dfedb4b4c7fa1a4aa48fe30be5" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ADD CONSTRAINT "FK_6627e7b5000d3569875b9a0914d" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" ADD CONSTRAINT "FK_c2fa814e00a89db880388129d43" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" DROP CONSTRAINT "FK_c2fa814e00a89db880388129d43"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" DROP CONSTRAINT "FK_6627e7b5000d3569875b9a0914d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" DROP CONSTRAINT "FK_2dfedb4b4c7fa1a4aa48fe30be5"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_data" DROP CONSTRAINT "FK_5f3edd0ed96b585b26ffb669e40"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "custom_field_data"`, undefined);
  }
}

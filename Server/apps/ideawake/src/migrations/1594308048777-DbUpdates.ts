import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594308048777 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "opp_evaluation_response" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" integer NOT NULL, "criteria_resp_data" json NOT NULL, "evaluation_criteria_id" integer, "opportunity_id" integer, "entity_type_id" integer, "user_id" integer, "community_id" integer, CONSTRAINT "PK_df1f7268fc800ed44f7c06cd0a5" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ADD CONSTRAINT "FK_4041bd4d8aa91a9749050b60201" FOREIGN KEY ("evaluation_criteria_id") REFERENCES "evaluation_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ADD CONSTRAINT "FK_30b98620c781d2d16a69d974a14" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ADD CONSTRAINT "FK_49dad8849ab93a567b741052786" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ADD CONSTRAINT "FK_f00916288ea18bc54c38329c720" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" ADD CONSTRAINT "FK_754308f39a6bf76d37e1b20affd" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" DROP CONSTRAINT "FK_754308f39a6bf76d37e1b20affd"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" DROP CONSTRAINT "FK_f00916288ea18bc54c38329c720"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" DROP CONSTRAINT "FK_49dad8849ab93a567b741052786"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" DROP CONSTRAINT "FK_30b98620c781d2d16a69d974a14"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_evaluation_response" DROP CONSTRAINT "FK_4041bd4d8aa91a9749050b60201"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opp_evaluation_response"`, undefined);
  }
}

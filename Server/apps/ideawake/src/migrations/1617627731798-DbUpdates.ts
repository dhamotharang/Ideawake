import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1617627731798 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "oppo_crit_eval_summary" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "avg_score" double precision, "avg_normalized_score" double precision, "score_detail" json, "variance" double precision, "resp_distribution" json, "opportunity_id" integer NOT NULL, "entity_type_id" integer NOT NULL, "entity_object_id" integer, "criteria_id" integer NOT NULL, "community_id" integer NOT NULL, CONSTRAINT "PK_e878dc39c8cc8b782bc98368530" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "oppo_eval_summary" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "score" double precision, "assignees" json, "completion_stats" json, "opportunity_id" integer NOT NULL, "entity_type_id" integer NOT NULL, "entity_object_id" integer, "community_id" integer NOT NULL, CONSTRAINT "PK_6d1dd5f3e4ef20c2d671c3c40c8" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" ADD CONSTRAINT "FK_3c8c54ce48fb3f4d6335f2e567a" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" ADD CONSTRAINT "FK_9d6a6241489d3b13247a75f5299" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" ADD CONSTRAINT "FK_244991c938c8fe4957d35254e40" FOREIGN KEY ("criteria_id") REFERENCES "evaluation_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" ADD CONSTRAINT "FK_6b36275d3a4371e8dda77d904c6" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_eval_summary" ADD CONSTRAINT "FK_1a11e96486da267a429e79f8c98" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_eval_summary" ADD CONSTRAINT "FK_b3df6b15d7407a8d6bb0d7f1c1b" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_eval_summary" ADD CONSTRAINT "FK_2a73b371e4cd884ac02fe7a8240" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "oppo_eval_summary" DROP CONSTRAINT "FK_2a73b371e4cd884ac02fe7a8240"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_eval_summary" DROP CONSTRAINT "FK_b3df6b15d7407a8d6bb0d7f1c1b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_eval_summary" DROP CONSTRAINT "FK_1a11e96486da267a429e79f8c98"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" DROP CONSTRAINT "FK_6b36275d3a4371e8dda77d904c6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" DROP CONSTRAINT "FK_244991c938c8fe4957d35254e40"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" DROP CONSTRAINT "FK_9d6a6241489d3b13247a75f5299"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "oppo_crit_eval_summary" DROP CONSTRAINT "FK_3c8c54ce48fb3f4d6335f2e567a"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "oppo_eval_summary"`, undefined);
    await queryRunner.query(`DROP TABLE "oppo_crit_eval_summary"`, undefined);
  }
}

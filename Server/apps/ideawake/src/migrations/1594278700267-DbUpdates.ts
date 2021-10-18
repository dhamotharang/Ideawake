import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594278700267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "evaluation_criteria" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" text NOT NULL, "criteria_object" json NOT NULL, "criteria_weight" integer NOT NULL, "evaluation_type_id" integer, "community_id" integer, CONSTRAINT "PK_1bf12cd7c46af786eec5987c5c5" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD CONSTRAINT "FK_8bc0fbd44c6e932652e38663d9d" FOREIGN KEY ("evaluation_type_id") REFERENCES "evaluation_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ADD CONSTRAINT "FK_1f8313114b0806ab00d3de57048" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP CONSTRAINT "FK_1f8313114b0806ab00d3de57048"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" DROP CONSTRAINT "FK_8bc0fbd44c6e932652e38663d9d"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "evaluation_criteria"`, undefined);
  }
}

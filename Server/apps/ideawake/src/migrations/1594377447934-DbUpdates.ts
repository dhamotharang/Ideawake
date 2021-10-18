import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594377447934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "evaluation_criteria_integration" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" integer, "order" integer NOT NULL, "entity_type_id" integer, "evaluation_criteria_id" integer, "community_id" integer, CONSTRAINT "PK_5e45f8cd562b39e25db4aee802b" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" ADD CONSTRAINT "FK_e41ca0e51c1fd08284e23710b6d" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" ADD CONSTRAINT "FK_c8134c1ac49d9ce772c2a0d5d26" FOREIGN KEY ("evaluation_criteria_id") REFERENCES "evaluation_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" ADD CONSTRAINT "FK_5887d3d18dc45b33508322b4683" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" DROP CONSTRAINT "FK_5887d3d18dc45b33508322b4683"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" DROP CONSTRAINT "FK_c8134c1ac49d9ce772c2a0d5d26"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria_integration" DROP CONSTRAINT "FK_e41ca0e51c1fd08284e23710b6d"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "evaluation_criteria_integration"`,
      undefined,
    );
  }
}

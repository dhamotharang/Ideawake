import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594271843673 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "evaluation_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" text NOT NULL, "icon" character varying(250) NOT NULL, "color" character varying(250) NOT NULL, "abbreviation" character varying(250) NOT NULL, CONSTRAINT "PK_a906ff2d5c394980616575a9301" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "evaluation_type"`, undefined);
  }
}

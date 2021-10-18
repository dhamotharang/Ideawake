import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587569978489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "status" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" character varying(2000), "color_code" character varying(250) NOT NULL, "order_number" bigint NOT NULL, "unique_id" character varying(250) NOT NULL, "community_id" integer, CONSTRAINT "UQ_3c2ba09fe4c05f6871086642782" UNIQUE ("unique_id", "community_id"), CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "stage" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" character varying(2000), "order_number" bigint NOT NULL, "stage_notification_settings" integer array NOT NULL DEFAULT '{}', "notification_message" character varying(2000), "status_id" integer, "workflow_id" integer, "community_id" integer, CONSTRAINT "PK_c54d11b3c24a188262844af1612" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "stage_notification_setting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "abbreviation" character varying(250) NOT NULL, CONSTRAINT "PK_2951e08fd70b40ac77fd0705a21" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "status" ADD CONSTRAINT "FK_646532c136ec2353219aa345ddb" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD CONSTRAINT "FK_ffd19e35fb64b9c60dab990c01c" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD CONSTRAINT "FK_971e4692dfe6ea9c66a84195269" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD CONSTRAINT "FK_f046435ff3df4ec188010b6080d" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage" DROP CONSTRAINT "FK_f046435ff3df4ec188010b6080d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP CONSTRAINT "FK_971e4692dfe6ea9c66a84195269"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP CONSTRAINT "FK_ffd19e35fb64b9c60dab990c01c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "status" DROP CONSTRAINT "FK_646532c136ec2353219aa345ddb"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "stage_notification_setting"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "stage"`, undefined);
    await queryRunner.query(`DROP TABLE "status"`, undefined);
  }
}

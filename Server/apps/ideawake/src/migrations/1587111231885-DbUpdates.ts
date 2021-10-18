import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587111231885 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "prize_awardee" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" integer NOT NULL, "message" character varying(2000), "entity_type_id" integer, "user_id" integer, "prize_id" integer, "community_id" integer, CONSTRAINT "PK_87becbac92414ec02ddab8841bd" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" ADD CONSTRAINT "FK_724f174bf147cf88d082e619089" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" ADD CONSTRAINT "FK_761b6703d85be3014274174df26" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" ADD CONSTRAINT "FK_5b22424a48336010a52afcd8701" FOREIGN KEY ("prize_id") REFERENCES "prize"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" ADD CONSTRAINT "FK_ce5dbaa235ec2bc4e2b8c2af1ac" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" DROP CONSTRAINT "FK_ce5dbaa235ec2bc4e2b8c2af1ac"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" DROP CONSTRAINT "FK_5b22424a48336010a52afcd8701"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" DROP CONSTRAINT "FK_761b6703d85be3014274174df26"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize_awardee" DROP CONSTRAINT "FK_724f174bf147cf88d082e619089"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "prize_awardee"`, undefined);
  }
}

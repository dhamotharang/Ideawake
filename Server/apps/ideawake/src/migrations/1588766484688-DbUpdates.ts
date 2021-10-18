import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1588766484688 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "challenge_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "attachment_type" character varying(250) NOT NULL, "url" text NOT NULL, "size" integer DEFAULT 0, "is_selected" smallint NOT NULL DEFAULT 0, "user_attachment_id" integer, "challenge_id" integer, CONSTRAINT "PK_e7f191078137df6141c25040b16" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_attachment" ADD CONSTRAINT "FK_77c69c8b11e008cfe7edc66d692" FOREIGN KEY ("user_attachment_id") REFERENCES "user_attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_attachment" ADD CONSTRAINT "FK_0d38721d482a36c604824728663" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge_attachment" DROP CONSTRAINT "FK_0d38721d482a36c604824728663"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_attachment" DROP CONSTRAINT "FK_77c69c8b11e008cfe7edc66d692"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "challenge_attachment"`, undefined);
  }
}

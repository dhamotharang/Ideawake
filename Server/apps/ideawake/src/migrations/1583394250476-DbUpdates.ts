import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1583394250476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "community_appearance_setting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "default_logo" character varying(250) NOT NULL, "mobile_logo" character varying(250) NOT NULL, "favicon" character varying(250) NOT NULL, "email_featured_image" character varying(250) NOT NULL, "primary_color" character varying(250) NOT NULL, "accent_color" character varying(250) NOT NULL, "navigation_background_color" character varying(250) NOT NULL, "navigation_text_color" character varying(250) NOT NULL, "footer_background_color" character varying(250) NOT NULL, "footer_text_color" character varying(250) NOT NULL, "jumbotron_background_image" character varying(250) NOT NULL, "jumbotron_page_title" character varying(250) NOT NULL, "jumbotron_page_description" character varying(250) NOT NULL, "community_id" integer, CONSTRAINT "REL_71bc00722d89b0c2e3c912c744" UNIQUE ("community_id"), CONSTRAINT "PK_52e4339ebc67a59915f66015ddc" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" ADD CONSTRAINT "FK_71bc00722d89b0c2e3c912c7443" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_appearance_setting" DROP CONSTRAINT "FK_71bc00722d89b0c2e3c912c7443"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "community_appearance_setting"`,
      undefined,
    );
  }
}

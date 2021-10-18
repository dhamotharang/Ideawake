import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587561138699 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "integration_authorize_with_enum" AS ENUM('ideawake', 'google', 'facebook')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "integration" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "app_name" character varying(250) NOT NULL, "redirect_url" character varying(250) NOT NULL, "client_id" character varying(250) NOT NULL, "client_secret" character varying(250) NOT NULL, "token" text NOT NULL, "authorize_with" "integration_authorize_with_enum" NOT NULL, "community_id" integer, CONSTRAINT "PK_f348d4694945d9dc4c7049a178a" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "integration" ADD CONSTRAINT "FK_e56f0a7d28b2a3cb706c0c2856c" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "integration" DROP CONSTRAINT "FK_e56f0a7d28b2a3cb706c0c2856c"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "integration"`, undefined);
    await queryRunner.query(
      `DROP TYPE "integration_authorize_with_enum"`,
      undefined,
    );
  }
}

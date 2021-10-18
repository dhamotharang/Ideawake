import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1599749790131 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "auth_integration_auth_type_enum" AS ENUM('SAML', 'OAuth')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_integration" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "auth_provider" character varying(250) NOT NULL, "auth_type" "auth_integration_auth_type_enum" NOT NULL DEFAULT 'SAML', "login_url" character varying(2048), "client_id" character varying(2048), "community_id" integer, CONSTRAINT "PK_acae89743bc9e4b9073efc4c8e9" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_integration" ADD CONSTRAINT "FK_85595406d20c791d3ee3a202cc2" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "auth_integration" DROP CONSTRAINT "FK_85595406d20c791d3ee3a202cc2"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "auth_integration"`, undefined);
    await queryRunner.query(
      `DROP TYPE "auth_integration_auth_type_enum"`,
      undefined,
    );
  }
}

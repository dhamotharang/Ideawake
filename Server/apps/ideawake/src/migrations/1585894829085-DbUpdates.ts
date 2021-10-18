import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585894829085 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "opportunity_user_opportunity_user_type_enum" AS ENUM('owner', 'contributor', 'submitter')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "opportunity_user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "message" text, "opportunity_user_type" "opportunity_user_opportunity_user_type_enum" NOT NULL, "user_id" integer, "opportunity_id" integer, "community_id" integer, CONSTRAINT "PK_8baecb8f647079c4ce03b354d1a" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" ADD CONSTRAINT "FK_6124e47629321a5d382a305185a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" ADD CONSTRAINT "FK_24862aa5843b4a1b265fb7d59c4" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" ADD CONSTRAINT "FK_d4bdaba3efafe316d1bf602e24b" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" DROP CONSTRAINT "FK_d4bdaba3efafe316d1bf602e24b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" DROP CONSTRAINT "FK_24862aa5843b4a1b265fb7d59c4"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_user" DROP CONSTRAINT "FK_6124e47629321a5d382a305185a"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opportunity_user"`, undefined);
    await queryRunner.query(
      `DROP TYPE "opportunity_user_opportunity_user_type_enum"`,
      undefined,
    );
  }
}

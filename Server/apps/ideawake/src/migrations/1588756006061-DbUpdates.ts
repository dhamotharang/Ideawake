import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1588756006061 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "mention_mentioned_object_type_enum" AS ENUM('user', 'group')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "mention" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "mentioned_object_id" integer NOT NULL, "mentioned_object_type" "mention_mentioned_object_type_enum" NOT NULL DEFAULT 'user', "title" character varying(250) NOT NULL, "entity_object_id" integer NOT NULL, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_9b02b76c4b65e3c35c1a545bf57" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "mention" ADD CONSTRAINT "FK_ff63bf5e5d2e0f0a851e0df9cfa" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "mention" ADD CONSTRAINT "FK_3ec999e474bcb7dcd4a2dad5f50" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "mention" DROP CONSTRAINT "FK_3ec999e474bcb7dcd4a2dad5f50"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "mention" DROP CONSTRAINT "FK_ff63bf5e5d2e0f0a851e0df9cfa"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "mention"`, undefined);
    await queryRunner.query(
      `DROP TYPE "mention_mentioned_object_type_enum"`,
      undefined,
    );
  }
}

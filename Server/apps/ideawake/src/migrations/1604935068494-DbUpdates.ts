import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1604935068494 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "hook_subscription_source_enum" AS ENUM('zapier', 'ms_team', 'slack')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "hook_subscription_status_enum" AS ENUM('active', 'suspended')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "hook_subscription_event_enum" AS ENUM('new_opportunity')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "hook_subscription" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "source" "hook_subscription_source_enum" NOT NULL DEFAULT 'zapier', "hook_url" character varying(300) NOT NULL, "status" "hook_subscription_status_enum" NOT NULL DEFAULT 'active', "event" "hook_subscription_event_enum" NOT NULL DEFAULT 'new_opportunity', "community_id" integer, CONSTRAINT "PK_73cfa094820d9511ccf51c233b3" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" ADD CONSTRAINT "FK_9794fa9190767557b6b7d7f39cf" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "hook_subscription" DROP CONSTRAINT "FK_9794fa9190767557b6b7d7f39cf"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "hook_subscription"`, undefined);
    await queryRunner.query(
      `DROP TYPE "hook_subscription_event_enum"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "hook_subscription_status_enum"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "hook_subscription_source_enum"`,
      undefined,
    );
  }
}

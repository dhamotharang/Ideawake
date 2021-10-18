import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584532115040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "entity_permissions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "allow_voting" boolean, "allow_commenting" boolean, "allow_sharing" boolean, "allow_anonymous_idea" boolean, "allow_anonymous_comment" boolean, "allow_anonymous_vote" boolean, "aost_entity" boolean, "adit_entity" boolean, "entity_object_id" integer NOT NULL, "community_id" integer, "entity_type_id" integer, CONSTRAINT "PK_1874a06a289e8ae8f6e72a4200d" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "role_actors_actor_type_enum" AS ENUM('user', 'group')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "role_actors" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "actor_type" "role_actors_actor_type_enum" NOT NULL DEFAULT 'user', "actor_id" integer NOT NULL, "role_id" integer, CONSTRAINT "PK_81c0ae468a0d2642cdf8d4a032a" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD "community_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "FK_68f8a31db8787ce3127fe7f67d8" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD CONSTRAINT "FK_e2891edec0b77daa71db560126b" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD CONSTRAINT "FK_c94f77263ee8e18f0b0b1449cc1" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD CONSTRAINT "FK_90043b6deb3ebacf675fe75d392" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP CONSTRAINT "FK_90043b6deb3ebacf675fe75d392"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP CONSTRAINT "FK_c94f77263ee8e18f0b0b1449cc1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP CONSTRAINT "FK_e2891edec0b77daa71db560126b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "FK_68f8a31db8787ce3127fe7f67d8"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP COLUMN "community_id"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "role_actors"`, undefined);
    await queryRunner.query(
      `DROP TYPE "role_actors_actor_type_enum"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "entity_permissions"`, undefined);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585661512895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE IF EXISTS "action_type"`, undefined);

    await queryRunner.query(
      `CREATE TABLE "action_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "abbreviation" character varying(250) NOT NULL, CONSTRAINT "UQ_51595da4c6d8dfb095403091a18" UNIQUE ("name"), CONSTRAINT "UQ_6ff2a1f321004ed72f00752f800" UNIQUE ("abbreviation"), CONSTRAINT "PK_d1c2e72ba9b5780623b78dde3f5" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "community_action_point" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "experience_point" integer NOT NULL, "repute_point" integer, "action_type_id" integer, "community_id" integer, "entity_type_id" integer, CONSTRAINT "PK_c4b47642c07fd1805e4bbda15e8" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP COLUMN "repute_point"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP COLUMN "entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD "repute_point" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD "user_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD CONSTRAINT "FK_93c19f662b7c9562ee4ef9b8475" FOREIGN KEY ("action_type_id") REFERENCES "action_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD CONSTRAINT "FK_30a31a1a10e1fdfd2c27e095857" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD CONSTRAINT "FK_3ebfbd82b5ab76cf5350904c0c0" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD CONSTRAINT "FK_f8e5ee30d4f61949c42490161d7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP CONSTRAINT "FK_f8e5ee30d4f61949c42490161d7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP CONSTRAINT "FK_3ebfbd82b5ab76cf5350904c0c0"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP CONSTRAINT "FK_30a31a1a10e1fdfd2c27e095857"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP CONSTRAINT "FK_93c19f662b7c9562ee4ef9b8475"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP COLUMN "user_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP COLUMN "entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP COLUMN "repute_point"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD "repute_point" integer`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "community_action_point"`, undefined);
    await queryRunner.query(`DROP TABLE "action_type"`, undefined);
  }
}

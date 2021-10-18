import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1586270636219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "entity_visibility_setting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "roles" text array, "individuals" text array, "groups" text array, "entity_object_id" character varying(300) NOT NULL, "public" boolean, "entity_type_id" integer, CONSTRAINT "PK_993fc9a04501951534f0671bc84" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" ADD CONSTRAINT "FK_e9317697ce5925e06749cc2c5a7" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_visibility_setting" DROP CONSTRAINT "FK_e9317697ce5925e06749cc2c5a7"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "entity_visibility_setting"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584636307718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP COLUMN "aost_entity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP COLUMN "adit_entity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD "post_entity" boolean`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD "edit_entity" boolean`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD "role_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD "entity_object_id" integer NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD CONSTRAINT "FK_5cd3fb0ecc83af20c202f18f8de" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD CONSTRAINT "FK_ec087b1be66d865a4b9416b5f40" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP CONSTRAINT "FK_ec087b1be66d865a4b9416b5f40"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP CONSTRAINT "FK_5cd3fb0ecc83af20c202f18f8de"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP COLUMN "entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP COLUMN "entity_object_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP COLUMN "role_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP COLUMN "edit_entity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" DROP COLUMN "post_entity"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD "adit_entity" boolean`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permissions" ADD "aost_entity" boolean`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1582030708751 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "email_lowercase_check"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "entity_object_id" character varying(300) NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_83c439874345b1e83ee8b6144a8" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_83c439874345b1e83ee8b6144a8"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "entity_object_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "email_lowercase_check" CHECK (((email)::text = lower((email)::text)))`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585557017370 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "share" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "message" text, "entity_object_id" character varying(300) NOT NULL, "shared_with_id" integer, "shared_by_id" integer, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_67a2b28d2cff31834bc2aa1ed7c" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" ADD CONSTRAINT "FK_3624c1b30cf76c826d0cacd2246" FOREIGN KEY ("shared_with_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" ADD CONSTRAINT "FK_0f1f99b4617d0666e4316fc523a" FOREIGN KEY ("shared_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" ADD CONSTRAINT "FK_63cfec853ec7b9622f2ce5e02b4" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" ADD CONSTRAINT "FK_8b4619fc359f234016ee18767a0" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "share" DROP CONSTRAINT "FK_8b4619fc359f234016ee18767a0"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" DROP CONSTRAINT "FK_63cfec853ec7b9622f2ce5e02b4"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" DROP CONSTRAINT "FK_0f1f99b4617d0666e4316fc523a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "share" DROP CONSTRAINT "FK_3624c1b30cf76c826d0cacd2246"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "share"`, undefined);
  }
}

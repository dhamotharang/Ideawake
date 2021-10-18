import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589789760562 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "action_item" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" character varying(2000), "abbreviation" character varying(250) NOT NULL, CONSTRAINT "PK_1214f6f4d832c402751617361c0" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "action_item_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD CONSTRAINT "FK_c04a160d0af95ece7bea613d495" FOREIGN KEY ("action_item_id") REFERENCES "action_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage" DROP CONSTRAINT "FK_c04a160d0af95ece7bea613d495"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "action_item_id"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "action_item"`, undefined);
  }
}

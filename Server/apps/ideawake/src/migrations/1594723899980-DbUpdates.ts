import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594723899980 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "stage_history" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "compute_object" json NOT NULL, "entering_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "exiting_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "stage_id" integer, "opportunity_id" integer, "action_item_id" integer, "community_id" integer, CONSTRAINT "PK_789f0cb9e2d415c00798cec5087" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ADD CONSTRAINT "FK_faf0fd15b0cd07af42e743c5c5b" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ADD CONSTRAINT "FK_60ba6f4ec18d0c5054262c2d6bb" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ADD CONSTRAINT "FK_3968cd1983a5acbb3480a264609" FOREIGN KEY ("action_item_id") REFERENCES "action_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" ADD CONSTRAINT "FK_5e0c3d2712388335ea65189355a" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_history" DROP CONSTRAINT "FK_5e0c3d2712388335ea65189355a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" DROP CONSTRAINT "FK_3968cd1983a5acbb3480a264609"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" DROP CONSTRAINT "FK_60ba6f4ec18d0c5054262c2d6bb"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_history" DROP CONSTRAINT "FK_faf0fd15b0cd07af42e743c5c5b"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "stage_history"`, undefined);
  }
}

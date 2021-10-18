import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1593181600069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "opportunity_field_linkage" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "field_id" integer, "opportunity_id" integer, "community_id" integer, CONSTRAINT "PK_d91316ab420f50008c06e2226fc" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" ADD CONSTRAINT "FK_72eb406989a96c460f3f70cbab9" FOREIGN KEY ("field_id") REFERENCES "custom_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" ADD CONSTRAINT "FK_92328a294ef470ece6e46558c30" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" ADD CONSTRAINT "FK_0708b33ee263bc512bdf10d20cd" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" DROP CONSTRAINT "FK_0708b33ee263bc512bdf10d20cd"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" DROP CONSTRAINT "FK_92328a294ef470ece6e46558c30"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_linkage" DROP CONSTRAINT "FK_72eb406989a96c460f3f70cbab9"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "opportunity_field_linkage"`,
      undefined,
    );
  }
}

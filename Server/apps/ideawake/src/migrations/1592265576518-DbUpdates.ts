import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1592265576518 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "opportunity_field_data" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "field_data" json NOT NULL, "history" json, "field_id" integer, "opportunity_id" integer, "community_id" integer, CONSTRAINT "PK_ccffa0657557cc0bb95bfed3f17" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" ADD CONSTRAINT "FK_c6eec4eb303d366c240e53de9ce" FOREIGN KEY ("field_id") REFERENCES "custom_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" ADD CONSTRAINT "FK_6ed0b8de6a454f0e9d1a5378a7b" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" ADD CONSTRAINT "FK_6ad762797277e393e65a83cdb1d" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" DROP CONSTRAINT "FK_6ad762797277e393e65a83cdb1d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" DROP CONSTRAINT "FK_6ed0b8de6a454f0e9d1a5378a7b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" DROP CONSTRAINT "FK_c6eec4eb303d366c240e53de9ce"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opportunity_field_data"`, undefined);
  }
}

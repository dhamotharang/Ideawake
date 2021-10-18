import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1591861096879 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "opportunity_type_field" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "order" integer, "opportunity_type_id" integer, "field_id" integer, "community_id" integer, CONSTRAINT "PK_498d60cb1e69e650e35afdb4d82" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" ADD CONSTRAINT "FK_fbc5085a31c1061745ebfb583f2" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" ADD CONSTRAINT "FK_44370170a8c933bb4d6a57f82aa" FOREIGN KEY ("field_id") REFERENCES "custom_field"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" ADD CONSTRAINT "FK_9cfd949eba4d1859eff51088d0f" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" DROP CONSTRAINT "FK_9cfd949eba4d1859eff51088d0f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" DROP CONSTRAINT "FK_44370170a8c933bb4d6a57f82aa"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" DROP CONSTRAINT "FK_fbc5085a31c1061745ebfb583f2"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opportunity_type_field"`, undefined);
  }
}

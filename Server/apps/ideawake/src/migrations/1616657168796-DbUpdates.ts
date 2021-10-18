import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1616657168796 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "opportunity_draft" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "title" text NOT NULL, "description" text, "anonymous" smallint NOT NULL DEFAULT 0, "tags" integer array DEFAULT '{}', "mentions" json, "attachments" json, "custom_fields_data" json, "opportunity_type_id" integer NOT NULL, "user_id" integer NOT NULL, "community_id" integer NOT NULL, "challenge_id" integer, "stage_id" integer, "workflow_id" integer, CONSTRAINT "PK_54bcac672b34c6d7c04c3a2f34e" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38ed82e84548f3f7470f8c1c97" ON "opportunity_draft" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8eab9563c2746044360465171e" ON "opportunity_draft" ("challenge_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_caf84293f77102559255b5a78e" ON "opportunity_draft" ("challenge_id", "community_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" ADD CONSTRAINT "FK_8dffc35d866eaeecb8289178a31" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" ADD CONSTRAINT "FK_5550d63281c9fb34956406e27ef" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" ADD CONSTRAINT "FK_38ed82e84548f3f7470f8c1c977" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" ADD CONSTRAINT "FK_8eab9563c2746044360465171e2" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" ADD CONSTRAINT "FK_0dc35e3bfd8e2537f95a46ed7d6" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" ADD CONSTRAINT "FK_659ec7b87969fc7f1aa89b73d9e" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" DROP CONSTRAINT "FK_659ec7b87969fc7f1aa89b73d9e"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" DROP CONSTRAINT "FK_0dc35e3bfd8e2537f95a46ed7d6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" DROP CONSTRAINT "FK_8eab9563c2746044360465171e2"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" DROP CONSTRAINT "FK_38ed82e84548f3f7470f8c1c977"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" DROP CONSTRAINT "FK_5550d63281c9fb34956406e27ef"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_draft" DROP CONSTRAINT "FK_8dffc35d866eaeecb8289178a31"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_caf84293f77102559255b5a78e"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_8eab9563c2746044360465171e"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_38ed82e84548f3f7470f8c1c97"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opportunity_draft"`, undefined);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1620802453052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "linked_opportunity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "relation" text NOT NULL, "community_id" integer NOT NULL, "opportunity_id" integer NOT NULL, "linked_oppo_id" integer NOT NULL, "linked_opportunity_id" integer, CONSTRAINT "PK_6543bc0891bc5e20ea272b5df83" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4658e372fd901248cc42742196" ON "linked_opportunity" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1249b471642ddce9f8bf2838de" ON "linked_opportunity" ("opportunity_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_50ebabd5848c260ac3fa8ac2c0" ON "linked_opportunity" ("linked_opportunity_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bdbb2e3e4ba28e23a9a730e32" ON "linked_opportunity" ("community_id", "opportunity_id", "linked_opportunity_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ADD CONSTRAINT "FK_4658e372fd901248cc427421967" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ADD CONSTRAINT "FK_1249b471642ddce9f8bf2838de3" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ADD CONSTRAINT "FK_50ebabd5848c260ac3fa8ac2c01" FOREIGN KEY ("linked_opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" DROP CONSTRAINT "FK_50ebabd5848c260ac3fa8ac2c01"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" DROP CONSTRAINT "FK_1249b471642ddce9f8bf2838de3"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" DROP CONSTRAINT "FK_4658e372fd901248cc427421967"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_7bdbb2e3e4ba28e23a9a730e32"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_50ebabd5848c260ac3fa8ac2c0"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_1249b471642ddce9f8bf2838de"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_4658e372fd901248cc42742196"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "linked_opportunity"`, undefined);
  }
}

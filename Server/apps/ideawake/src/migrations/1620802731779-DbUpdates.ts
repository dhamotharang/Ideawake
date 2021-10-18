import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1620802731779 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" DROP COLUMN "linked_oppo_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" DROP CONSTRAINT "FK_50ebabd5848c260ac3fa8ac2c01"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_7bdbb2e3e4ba28e23a9a730e32"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ALTER COLUMN "linked_opportunity_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bdbb2e3e4ba28e23a9a730e32" ON "linked_opportunity" ("community_id", "opportunity_id", "linked_opportunity_id") `,
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
      `DROP INDEX "IDX_7bdbb2e3e4ba28e23a9a730e32"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ALTER COLUMN "linked_opportunity_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bdbb2e3e4ba28e23a9a730e32" ON "linked_opportunity" ("community_id", "opportunity_id", "linked_opportunity_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ADD CONSTRAINT "FK_50ebabd5848c260ac3fa8ac2c01" FOREIGN KEY ("linked_opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "linked_opportunity" ADD "linked_oppo_id" integer NOT NULL`,
      undefined,
    );
  }
}

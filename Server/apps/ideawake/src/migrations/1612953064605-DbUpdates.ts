import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1612953064605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_4ced6cf1990576a7f06ba28b436"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_978aedb01c20a25a6923686e61f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_8baecb8f647079c4ce03b354d1a"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_c874d40ddbb73e7af13525f53a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "opportunity_type_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "community_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "user_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c874d40ddbb73e7af13525f53a" ON "opportunity" ("challenge_id", "community_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_4ced6cf1990576a7f06ba28b436" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_978aedb01c20a25a6923686e61f" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_8baecb8f647079c4ce03b354d1a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_8baecb8f647079c4ce03b354d1a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_978aedb01c20a25a6923686e61f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_4ced6cf1990576a7f06ba28b436"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_c874d40ddbb73e7af13525f53a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "user_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "community_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ALTER COLUMN "opportunity_type_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c874d40ddbb73e7af13525f53a" ON "opportunity" ("community_id", "challenge_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_8baecb8f647079c4ce03b354d1a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_978aedb01c20a25a6923686e61f" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_4ced6cf1990576a7f06ba28b436" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

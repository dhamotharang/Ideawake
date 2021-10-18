import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1613386540535 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_975b19366975001d0b5155b3021"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_367cffa222294e367a84495f302"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ALTER COLUMN "challenge_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ALTER COLUMN "community_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_975b19366975001d0b5155b302" ON "prize" ("challenge_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_367cffa222294e367a84495f30" ON "prize" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_975b19366975001d0b5155b3021" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_367cffa222294e367a84495f302" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_367cffa222294e367a84495f302"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" DROP CONSTRAINT "FK_975b19366975001d0b5155b3021"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_367cffa222294e367a84495f30"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_975b19366975001d0b5155b302"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ALTER COLUMN "community_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ALTER COLUMN "challenge_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_367cffa222294e367a84495f302" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "prize" ADD CONSTRAINT "FK_975b19366975001d0b5155b3021" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1613381596157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_101c9ed867249a99c03f8e76a0f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_eeb4f6a1826ab16de1b9d3ff56c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_cf94dcb2ebe61a81283ecde0f51"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "opportunity_type_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "community_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "user_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_101c9ed867249a99c03f8e76a0f" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_eeb4f6a1826ab16de1b9d3ff56c" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_cf94dcb2ebe61a81283ecde0f51" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_cf94dcb2ebe61a81283ecde0f51"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_eeb4f6a1826ab16de1b9d3ff56c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_101c9ed867249a99c03f8e76a0f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "user_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "community_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ALTER COLUMN "opportunity_type_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_cf94dcb2ebe61a81283ecde0f51" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_eeb4f6a1826ab16de1b9d3ff56c" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_101c9ed867249a99c03f8e76a0f" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

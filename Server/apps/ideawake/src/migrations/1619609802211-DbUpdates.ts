import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1619609802211 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "filter_option" DROP CONSTRAINT "FK_9d26d06a62e2fdb5eebe74051cb"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_9d26d06a62e2fdb5eebe74051c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" DROP COLUMN "user_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" ADD "manage_opportunity_filters" smallint NOT NULL DEFAULT 0`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_wise_permission" DROP COLUMN "manage_opportunity_filters"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" ADD "user_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d26d06a62e2fdb5eebe74051c" ON "filter_option" ("user_id") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "filter_option" ADD CONSTRAINT "FK_9d26d06a62e2fdb5eebe74051cb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

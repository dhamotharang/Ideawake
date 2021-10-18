import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584108822168 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "user_id" integer`,
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
      `ALTER TABLE "challenge" DROP COLUMN "user_id"`,
      undefined,
    );
  }
}

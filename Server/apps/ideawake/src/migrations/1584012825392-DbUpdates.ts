import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584012825392 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "challenge_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_c7c1cf6c438b8799a94fefeaed0" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_c7c1cf6c438b8799a94fefeaed0"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "challenge_id"`,
      undefined,
    );
  }
}

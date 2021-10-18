import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597053551160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "community_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_66aa3f6d5d6ccedef9f76fcb4ed" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_66aa3f6d5d6ccedef9f76fcb4ed"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "community_id"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1606901033651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ALTER COLUMN "duplicatable_types" SET DEFAULT '{}'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ALTER COLUMN "duplicatable_types" DROP DEFAULT`,
      undefined,
    );
  }
}

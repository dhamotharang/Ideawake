import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1586948679028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role" ADD "abbreviation" character varying(250)`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role" DROP COLUMN "abbreviation"`,
      undefined,
    );
  }
}

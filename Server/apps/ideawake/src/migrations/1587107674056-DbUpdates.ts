import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587107674056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "city" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "time_zone" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lat_lng" text array`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "lat_lng"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "time_zone"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "city"`, undefined);
  }
}

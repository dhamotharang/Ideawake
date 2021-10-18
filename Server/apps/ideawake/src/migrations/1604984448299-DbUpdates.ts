import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1604984448299 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE INDEX "IDX_eeb4f6a1826ab16de1b9d3ff56" ON "challenge" ("community_id") `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_eeb4f6a1826ab16de1b9d3ff56"`,
      undefined,
    );
  }
}

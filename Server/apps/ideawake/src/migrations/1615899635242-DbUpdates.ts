import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1615899635242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_683f716ab433c7c8916fa04271"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_683f716ab433c7c8916fa04271" ON "opportunity_type" ("community_id", "abbreviation") `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_683f716ab433c7c8916fa04271"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_683f716ab433c7c8916fa04271" ON "opportunity_type" ("abbreviation", "community_id") `,
      undefined,
    );
  }
}

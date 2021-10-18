import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1604648311664 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE INDEX "IDX_978aedb01c20a25a6923686e61" ON "opportunity" ("community_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7c1cf6c438b8799a94fefeaed" ON "opportunity" ("challenge_id") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c874d40ddbb73e7af13525f53a" ON "opportunity" ("challenge_id", "community_id") `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_c874d40ddbb73e7af13525f53a"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_c7c1cf6c438b8799a94fefeaed"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_978aedb01c20a25a6923686e61"`,
      undefined,
    );
  }
}

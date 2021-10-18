import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1621248225704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" RENAME COLUMN "linkeble_types" TO "linkable_types"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" RENAME COLUMN "linkable_types" TO "linkeble_types"`,
      undefined,
    );
  }
}

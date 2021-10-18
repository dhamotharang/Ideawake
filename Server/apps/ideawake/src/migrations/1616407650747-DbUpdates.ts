import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1616407650747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" ADD "is_translation" boolean NOT NULL DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "is_translation"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1594301507138 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ALTER COLUMN "description" DROP NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_criteria" ALTER COLUMN "description" SET NOT NULL`,
      undefined,
    );
  }
}

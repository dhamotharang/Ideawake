import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1602675145402 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "title" DROP NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "title" SET NOT NULL`,
      undefined,
    );
  }
}

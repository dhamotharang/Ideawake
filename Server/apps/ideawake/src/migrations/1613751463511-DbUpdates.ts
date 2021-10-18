import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1613751463511 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_type" ADD "example_image_url" text`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_type" DROP COLUMN "example_image_url"`,
      undefined,
    );
  }
}

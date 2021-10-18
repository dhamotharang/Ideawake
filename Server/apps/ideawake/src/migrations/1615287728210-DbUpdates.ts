import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1615287728210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "title_placeholder" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "desc_placeholder" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "post_title_placeholder" text`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "post_desc_placeholder" text`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "post_desc_placeholder"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP COLUMN "post_title_placeholder"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "desc_placeholder"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "title_placeholder"`,
      undefined,
    );
  }
}

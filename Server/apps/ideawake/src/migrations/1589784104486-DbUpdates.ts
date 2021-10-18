import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1589784104486 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" ADD "message" character varying(2000)`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage_notification_setting" DROP COLUMN "message"`,
      undefined,
    );
  }
}

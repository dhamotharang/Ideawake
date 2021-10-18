import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587627138375 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "notifiable_individuals" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "notifiable_groups" integer array NOT NULL DEFAULT '{}'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" ADD "send_notifcation_email" boolean NOT NULL DEFAULT false`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "send_notifcation_email"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "notifiable_groups"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "stage" DROP COLUMN "notifiable_individuals"`,
      undefined,
    );
  }
}

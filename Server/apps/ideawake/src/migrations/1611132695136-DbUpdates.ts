import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1611132695136 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" DROP COLUMN "name"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" ADD "name" text`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585910925260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "invite" ADD "user_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_2713f74581f41683d03e45adce9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_2713f74581f41683d03e45adce9"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP COLUMN "user_id"`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1614178691503 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_90442924139218fa1799ddf700d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_2713f74581f41683d03e45adce9"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ALTER COLUMN "community_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ALTER COLUMN "user_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_90442924139218fa1799ddf700d" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_90442924139218fa1799ddf700d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ALTER COLUMN "user_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ALTER COLUMN "community_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_2713f74581f41683d03e45adce9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_90442924139218fa1799ddf700d" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

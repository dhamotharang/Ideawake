import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1611317218033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" DROP CONSTRAINT "FK_7b339bfe07138686771362352d7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" ADD CONSTRAINT "UQ_7b339bfe07138686771362352d7" UNIQUE ("announcement_id")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" ADD CONSTRAINT "FK_7b339bfe07138686771362352d7" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" DROP CONSTRAINT "FK_7b339bfe07138686771362352d7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" DROP CONSTRAINT "UQ_7b339bfe07138686771362352d7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" ADD CONSTRAINT "FK_7b339bfe07138686771362352d7" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

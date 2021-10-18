import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584643684528 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD "community_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD CONSTRAINT "FK_63069b5a8a47b3f1f19146304d1" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP CONSTRAINT "FK_63069b5a8a47b3f1f19146304d1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP COLUMN "community_id"`,
      undefined,
    );
  }
}

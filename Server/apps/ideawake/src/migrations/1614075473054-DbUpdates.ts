import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1614075473054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP CONSTRAINT "FK_90043b6deb3ebacf675fe75d392"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" DROP CONSTRAINT "FK_63069b5a8a47b3f1f19146304d1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "role_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "community_id" SET NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD CONSTRAINT "FK_90043b6deb3ebacf675fe75d392" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "role_actors" DROP CONSTRAINT "FK_90043b6deb3ebacf675fe75d392"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "community_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "role_id" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD CONSTRAINT "FK_63069b5a8a47b3f1f19146304d1" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "role_actors" ADD CONSTRAINT "FK_90043b6deb3ebacf675fe75d392" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585651490518 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "entity_object_id" DROP NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "role_actors" ALTER COLUMN "entity_object_id" SET NOT NULL`,
      undefined,
    );
  }
}

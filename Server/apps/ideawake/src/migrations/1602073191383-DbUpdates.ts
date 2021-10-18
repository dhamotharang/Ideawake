import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1602073191383 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "widget" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ADD CONSTRAINT "FK_4f4269a4523119064288d4abb2f" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "widget" DROP CONSTRAINT "FK_4f4269a4523119064288d4abb2f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" DROP COLUMN "entity_type_id"`,
      undefined,
    );
  }
}

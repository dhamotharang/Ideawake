import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1584717979814 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP CONSTRAINT "FK_1c83f900d695838ed8aee2e51d9"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" DROP COLUMN "role_id"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD "role_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_experience_setting" ADD CONSTRAINT "FK_1c83f900d695838ed8aee2e51d9" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

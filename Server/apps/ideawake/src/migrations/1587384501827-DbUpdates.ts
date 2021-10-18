import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587384501827 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD "entity_object_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD "entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD CONSTRAINT "FK_c24016cba74c8974eb32635512a" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP CONSTRAINT "FK_c24016cba74c8974eb32635512a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP COLUMN "entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP COLUMN "entity_object_id"`,
      undefined,
    );
  }
}

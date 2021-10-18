import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1609339351643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD "action_entity_object_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD "action_entity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD CONSTRAINT "FK_6a373aeec6d0302d498e220a7a6" FOREIGN KEY ("action_entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP CONSTRAINT "FK_6a373aeec6d0302d498e220a7a6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP COLUMN "action_entity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP COLUMN "action_entity_object_id"`,
      undefined,
    );
  }
}

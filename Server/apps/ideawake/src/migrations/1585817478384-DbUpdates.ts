import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1585817478384 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP CONSTRAINT "FK_f8e5ee30d4f61949c42490161d7"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_action_point" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "experience_point" integer NOT NULL, "action_type_id" integer, "user_id" integer, "community_id" integer, CONSTRAINT "PK_66266a234bade8bb17a0347ce46" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" DROP COLUMN "user_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD CONSTRAINT "FK_34e14075e51d1cd92769df621cf" FOREIGN KEY ("action_type_id") REFERENCES "action_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD CONSTRAINT "FK_08bb952fa704f8158a15625c4ab" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" ADD CONSTRAINT "FK_0d8660db8c648beee79f5df585e" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP CONSTRAINT "FK_0d8660db8c648beee79f5df585e"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP CONSTRAINT "FK_08bb952fa704f8158a15625c4ab"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_action_point" DROP CONSTRAINT "FK_34e14075e51d1cd92769df621cf"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD "user_id" integer`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "user_action_point"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "community_action_point" ADD CONSTRAINT "FK_f8e5ee30d4f61949c42490161d7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

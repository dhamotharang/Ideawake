import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597310680425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_circles" DROP CONSTRAINT "FK_10cf5024a3cbd0350d31abfda75"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" DROP CONSTRAINT "FK_77dbe7f2fab77d1383aaf7e67cc"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ALTER COLUMN "user_id" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `DROP SEQUENCE "user_circles_user_id_seq"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ALTER COLUMN "circle_id" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `DROP SEQUENCE "user_circles_circle_id_seq"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ADD CONSTRAINT "FK_10cf5024a3cbd0350d31abfda75" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ADD CONSTRAINT "FK_77dbe7f2fab77d1383aaf7e67cc" FOREIGN KEY ("circle_id") REFERENCES "circle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_circles" DROP CONSTRAINT "FK_77dbe7f2fab77d1383aaf7e67cc"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" DROP CONSTRAINT "FK_10cf5024a3cbd0350d31abfda75"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE SEQUENCE "user_circles_circle_id_seq" OWNED BY "user_circles"."circle_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ALTER COLUMN "circle_id" SET DEFAULT nextval('user_circles_circle_id_seq')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE SEQUENCE "user_circles_user_id_seq" OWNED BY "user_circles"."user_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ALTER COLUMN "user_id" SET DEFAULT nextval('user_circles_user_id_seq')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ADD CONSTRAINT "FK_77dbe7f2fab77d1383aaf7e67cc" FOREIGN KEY ("circle_id") REFERENCES "circle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" ADD CONSTRAINT "FK_10cf5024a3cbd0350d31abfda75" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

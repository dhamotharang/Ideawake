import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1602057499745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "dashboard" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" text, "community_id" integer, CONSTRAINT "PK_233ed28fa3a1f9fbe743f571f75" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "widget_widget_type_enum" AS ENUM('Pie', 'Bar', 'TimeSeries', 'Bubble', 'Pivot', 'CounterTable')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "widget" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "config_data" json NOT NULL, "widget_type" "widget_widget_type_enum" NOT NULL DEFAULT 'Pie', "community_id" integer, "dashboard_id" integer, CONSTRAINT "PK_feb5fda4f8d30bbe0022f4ca804" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard" ADD CONSTRAINT "FK_e1a1b65e5d4d5a965db36e1b539" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ADD CONSTRAINT "FK_3a00ee2af4f4fdd87cbaaa3aae6" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ADD CONSTRAINT "FK_71b6091f14b59401e802b98eaf1" FOREIGN KEY ("dashboard_id") REFERENCES "dashboard"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "widget" DROP CONSTRAINT "FK_71b6091f14b59401e802b98eaf1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" DROP CONSTRAINT "FK_3a00ee2af4f4fdd87cbaaa3aae6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard" DROP CONSTRAINT "FK_e1a1b65e5d4d5a965db36e1b539"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "widget"`, undefined);
    await queryRunner.query(`DROP TYPE "widget_widget_type_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "dashboard"`, undefined);
  }
}

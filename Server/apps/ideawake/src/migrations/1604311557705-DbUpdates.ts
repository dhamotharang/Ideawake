import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1604311557705 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TYPE "public"."widget_widget_type_enum" RENAME TO "widget_widget_type_enum_old"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "widget_widget_type_enum" AS ENUM('Pie', 'Bar', 'TimeSeries', 'Bubble', 'Pivot', 'CounterTable', 'Aggregated')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "widget_type" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "widget_type" TYPE "widget_widget_type_enum" USING "widget_type"::"text"::"widget_widget_type_enum"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "widget_type" SET DEFAULT 'Pie'`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "widget_widget_type_enum_old"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "widget_widget_type_enum_old" AS ENUM('Pie', 'Bar', 'TimeSeries', 'Bubble', 'Pivot', 'CounterTable')`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "widget_type" DROP DEFAULT`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "widget_type" TYPE "widget_widget_type_enum_old" USING "widget_type"::"text"::"widget_widget_type_enum_old"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ALTER COLUMN "widget_type" SET DEFAULT 'Pie'`,
      undefined,
    );
    await queryRunner.query(`DROP TYPE "widget_widget_type_enum"`, undefined);
    await queryRunner.query(
      `ALTER TYPE "widget_widget_type_enum_old" RENAME TO  "widget_widget_type_enum"`,
      undefined,
    );
  }
}

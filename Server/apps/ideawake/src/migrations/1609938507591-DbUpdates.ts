import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1609938507591 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "temp_message" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.comment SET temp_message = comment.message;`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "message"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "message" text`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.comment SET message = comment.temp_message;`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "temp_message"`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "temp_message" text`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.comment SET temp_message = comment.message;`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "message"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "message" character varying(2000)`,
      undefined,
    );

    await queryRunner.query(
      `UPDATE public.comment
        SET message = CAST (comment.temp_message AS character varying(2000));`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "temp_message"`,
      undefined,
    );
  }
}

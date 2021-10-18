import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1583301604861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_9912f9acd104a96a57af6057229"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_468517dd0db99560f9b5052d968"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP COLUMN "abbreviation"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP COLUMN "community"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "abbreviation"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "community"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD "opportunity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "opportunity_type_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_4ab5992fe300a3d4e412de8490e" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_4ced6cf1990576a7f06ba28b436" FOREIGN KEY ("opportunity_type_id") REFERENCES "opportunity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_4ced6cf1990576a7f06ba28b436"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_4ab5992fe300a3d4e412de8490e"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "opportunity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP COLUMN "opportunity_type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "community" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "abbreviation" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD "community" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD "abbreviation" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_468517dd0db99560f9b5052d968" FOREIGN KEY ("abbreviation", "community") REFERENCES "opportunity_type"("abbreviation","community_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_9912f9acd104a96a57af6057229" FOREIGN KEY ("abbreviation", "community") REFERENCES "opportunity_type"("abbreviation","community_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

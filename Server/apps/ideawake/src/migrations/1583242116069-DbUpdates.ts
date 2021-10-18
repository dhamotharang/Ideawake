import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1583242116069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_36629cc179efe369d260953cc17"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_a018d2ada934bea6a3b425f59ec"`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "opportunity_type_posting_experience" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, CONSTRAINT "PK_de4b72649ca00634e194970902b" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP CONSTRAINT "UQ_ba32deb1fdcda411a83fbf7fad1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP COLUMN "type_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "type_id"`,
      undefined,
    );

    await queryRunner.query(`TRUNCATE TABLE "opportunity_type"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "abbreviation" character varying NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "posting_experience_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "community_id" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD "abbreviation" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD "community" integer`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "abbreviation" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "community" integer`,
      undefined,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_683f716ab433c7c8916fa04271" ON "opportunity_type" ("community_id", "abbreviation") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD CONSTRAINT "FK_de4b72649ca00634e194970902b" FOREIGN KEY ("posting_experience_id") REFERENCES "opportunity_type_posting_experience"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD CONSTRAINT "FK_b6dea02a62a1cf72d9e0f35a55c" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_9912f9acd104a96a57af6057229" FOREIGN KEY ("abbreviation", "community") REFERENCES "opportunity_type"("abbreviation","community_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_468517dd0db99560f9b5052d968" FOREIGN KEY ("abbreviation", "community") REFERENCES "opportunity_type"("abbreviation","community_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_468517dd0db99560f9b5052d968"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_9912f9acd104a96a57af6057229"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP CONSTRAINT "FK_b6dea02a62a1cf72d9e0f35a55c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP CONSTRAINT "FK_de4b72649ca00634e194970902b"`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_683f716ab433c7c8916fa04271"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "community"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP COLUMN "abbreviation"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP COLUMN "community"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP COLUMN "abbreviation"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "community_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "posting_experience_id"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" DROP COLUMN "abbreviation"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD "type_id" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD "type_id" character varying`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD "type_id" character varying NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type" ADD CONSTRAINT "UQ_ba32deb1fdcda411a83fbf7fad1" UNIQUE ("type_id")`,
      undefined,
    );
    await queryRunner.query(
      `DROP TABLE "opportunity_type_posting_experience"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_a018d2ada934bea6a3b425f59ec" FOREIGN KEY ("type_id") REFERENCES "opportunity_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_36629cc179efe369d260953cc17" FOREIGN KEY ("type_id") REFERENCES "opportunity_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

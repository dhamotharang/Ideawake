import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1612433169404 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "blacklist_email" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "email" text NOT NULL, "community_id" integer NOT NULL, CONSTRAINT "UQ_7b08d8ea08920b536d4690be9bb" UNIQUE ("email", "community_id"), CONSTRAINT "PK_b20dd9b0fc85cc58e1f358d7658" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "blacklist_email" ADD CONSTRAINT "FK_cd9035815f8c162d21678938017" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "blacklist_email" DROP CONSTRAINT "FK_cd9035815f8c162d21678938017"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "blacklist_email"`, undefined);
  }
}

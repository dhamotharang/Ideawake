import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1611060977380 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "announce_targeting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "roles" integer array NOT NULL DEFAULT '{}', "individuals" integer array NOT NULL DEFAULT '{}', "groups" integer array NOT NULL DEFAULT '{}', "public" boolean NOT NULL DEFAULT false, "followers" boolean NOT NULL DEFAULT false, "voters" boolean NOT NULL DEFAULT false, "challenge_participants" boolean NOT NULL DEFAULT false, "action_item_related" text, "announcement_id" integer, "community_id" integer NOT NULL, CONSTRAINT "PK_19606d7fdd698da1764b61b3ac1" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "announce_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "attachment_type" character varying(1024) NOT NULL, "name" text, "url" text NOT NULL, "size" integer DEFAULT 0, "user_attachment_id" integer, "announcement_id" integer, "community_id" integer NOT NULL, CONSTRAINT "PK_1cd1a4603a3bb6ec81f6b6be35b" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "announcement_status_enum" AS ENUM('draft', 'scheduled', 'sent')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean DEFAULT false, "updated_by" character varying(100), "created_by" character varying(100), "title" text NOT NULL, "message" text NOT NULL, "status" "announcement_status_enum" NOT NULL DEFAULT 'scheduled', "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "view_count" bigint NOT NULL DEFAULT 0, "send_email" boolean NOT NULL DEFAULT true, "send_feed" boolean NOT NULL DEFAULT true, "entity_object_id" integer, "poster_id" integer, "entity_type_id" integer, "community_id" integer NOT NULL, "exp_setting_id" integer, CONSTRAINT "PK_e0ef0550174fd1099a308fd18a0" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" ADD CONSTRAINT "FK_7b339bfe07138686771362352d7" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" ADD CONSTRAINT "FK_d2e595e24c6d748e93286be756b" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" ADD CONSTRAINT "FK_f157aaf71c5e2b24184150cb11c" FOREIGN KEY ("user_attachment_id") REFERENCES "user_attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" ADD CONSTRAINT "FK_678f8222f64deda3bf62ef924bb" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" ADD CONSTRAINT "FK_192dd4cb4cc9fa7e88a22a30688" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_c8531d46f2c2f7f95054d1165e5" FOREIGN KEY ("poster_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_d029a4a33bb35996990f3b433ec" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_d2e958851af2b2adff5e8b7658b" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_5cafa1967c3298e15df5d220442" FOREIGN KEY ("exp_setting_id") REFERENCES "entity_experience_setting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_5cafa1967c3298e15df5d220442"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_d2e958851af2b2adff5e8b7658b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_d029a4a33bb35996990f3b433ec"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_c8531d46f2c2f7f95054d1165e5"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" DROP CONSTRAINT "FK_192dd4cb4cc9fa7e88a22a30688"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" DROP CONSTRAINT "FK_678f8222f64deda3bf62ef924bb"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_attachment" DROP CONSTRAINT "FK_f157aaf71c5e2b24184150cb11c"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" DROP CONSTRAINT "FK_d2e595e24c6d748e93286be756b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "announce_targeting" DROP CONSTRAINT "FK_7b339bfe07138686771362352d7"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "announcement"`, undefined);
    await queryRunner.query(`DROP TYPE "announcement_status_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "announce_attachment"`, undefined);
    await queryRunner.query(`DROP TABLE "announce_targeting"`, undefined);
  }
}

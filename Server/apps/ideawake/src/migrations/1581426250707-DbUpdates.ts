import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1581426250707 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "theme" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "color_code" character varying(250) NOT NULL, CONSTRAINT "PK_c1934d0b4403bf10c1ab0c18166" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "language" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(150) NOT NULL, "abbreviation" character varying(10) NOT NULL, CONSTRAINT "PK_cc0a99e710eb3733f6fb42b1d4c" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "email" character varying(150) NOT NULL, "owner_user_id" integer, "language_id" integer, "theme_id" integer, CONSTRAINT "REL_b78e0aca3e3f4f697a53f52626" UNIQUE ("owner_user_id"), CONSTRAINT "REL_3d3dbb27b5558fe8b2f9c65ec2" UNIQUE ("language_id"), CONSTRAINT "REL_b488a6c4f68d1c4f42bdb8d90c" UNIQUE ("theme_id"), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "community_visibility_enum" AS ENUM('Private', 'Open', 'Public')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "community" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(350) NOT NULL, "description" character varying(2000) NOT NULL, "url" character varying(150) NOT NULL, "visibility" "community_visibility_enum" NOT NULL DEFAULT 'Private', "s3_settings" text, "logo" character varying(1000), "email_logo" character varying(1000), "is_open" boolean NOT NULL, "salt" character varying(100), "last_login" TIMESTAMP WITH TIME ZONE NOT NULL, "is_sso" boolean NOT NULL, "theme_id" integer, "tenant_id" integer, "owner_user_id" integer, CONSTRAINT "UQ_daad5c9b6f949ded307072b08b5" UNIQUE ("url"), CONSTRAINT "REL_39ed6f690096855811b1fec6f9" UNIQUE ("theme_id"), CONSTRAINT "REL_499740426e784c5ec98c1f5072" UNIQUE ("tenant_id"), CONSTRAINT "REL_65b528d4ef4d0481bba053c1cd" UNIQUE ("owner_user_id"), CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "user_communities_community_role_enum" AS ENUM('Admin', 'Moderator', 'User')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_communities_community" ("user_id" SERIAL NOT NULL, "community_id" SERIAL NOT NULL, "role" "user_communities_community_role_enum" NOT NULL DEFAULT 'User', CONSTRAINT "PK_e19365bf07c7db734c20e7dd910" PRIMARY KEY ("user_id", "community_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "abbreviation" character varying(250) NOT NULL, "entity_code" character varying(250) NOT NULL, CONSTRAINT "UQ_1621804c5e780cad9e9a06da4b5" UNIQUE ("name"), CONSTRAINT "UQ_bfdbb06d34a48a68905227c7d99" UNIQUE ("abbreviation"), CONSTRAINT "UQ_05085207ee10a7ef2b4094b8b43" UNIQUE ("entity_code"), CONSTRAINT "PK_a673aa035fbda0a8f4b1bf81286" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "tag_status_enum" AS ENUM('Active', 'Pending', 'Deleted')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "entity_object_id" character varying(300) NOT NULL, "status" "tag_status_enum" NOT NULL DEFAULT 'Active', "is_pre_define" smallint NOT NULL DEFAULT 0, "entity_type_id" integer, "user_id" integer, "community_id" integer, CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_tags" ("user_id" SERIAL NOT NULL, "tag_id" SERIAL NOT NULL, "entity_object_id" character varying(300) NOT NULL, CONSTRAINT "PK_1383f92433abfd0fed78029375b" PRIMARY KEY ("user_id", "tag_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "circle" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(300) NOT NULL, "display_name" character varying(200), "type" character varying(200), "parent_circle_id" character varying(300), "image_url" text, "pinned_to_shortcut" boolean, "community_id" integer, "user_id" integer, CONSTRAINT "PK_9acc76020bf08433e769e72deb0" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "user_circles_role_enum" AS ENUM('Admin', 'Moderator', 'User')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_circles" ("user_id" SERIAL NOT NULL, "circle_id" SERIAL NOT NULL, "role" "user_circles_role_enum" NOT NULL DEFAULT 'User', CONSTRAINT "PK_e6a8e11bdfce20a11c0c75b308a" PRIMARY KEY ("user_id", "circle_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "opportunity_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "description" character varying(2000) NOT NULL, "icon" character varying(250), "color" character varying(250), "is_enabled" boolean, "type_id" character varying NOT NULL, CONSTRAINT "UQ_ba32deb1fdcda411a83fbf7fad1" UNIQUE ("type_id"), CONSTRAINT "PK_a018d2ada934bea6a3b425f59ec" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_attachments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "attachment_type" character varying(250) NOT NULL, "url" text NOT NULL, "size" integer DEFAULT 0, "user_id" integer, "community_id" integer, CONSTRAINT "PK_859909c9f55bd0cae3f6f6bf730" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "opportunity_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "attachment_type" character varying(250) NOT NULL, "url" text NOT NULL, "size" integer DEFAULT 0, "is_selected" smallint NOT NULL DEFAULT 0, "user_attachment_id" integer, "type_id" character varying, "opportunity_id" integer, CONSTRAINT "PK_f5abe827dff1391b3929973c938" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "opportunity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "title" character varying(250) NOT NULL, "description" character varying(2000), "draft" boolean DEFAULT true, "tags" text array, "mentions" text array, "anonymous" smallint NOT NULL DEFAULT 0, "type_id" character varying, "community_id" integer, "user_id" integer, CONSTRAINT "PK_085fd6d6f4765325e6c16163568" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('Admin', 'Moderator', 'User')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "first_name" character varying(200) NOT NULL, "last_name" character varying(200) NOT NULL, "user_name" character varying(200), "role" "user_role_enum" NOT NULL DEFAULT 'User', "email" character varying(200) NOT NULL, "secondary_email" character varying(200), "password" character varying(300) NOT NULL, "salt" character varying(100), "last_login" TIMESTAMP WITH TIME ZONE NOT NULL, "is_sso" boolean NOT NULL, "image_url" character varying, "profile_bio" character varying, "skills" text array, "region" character varying, "country" character varying, "zip_code" character varying, "position" character varying, "company" character varying, "profile_image_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_f0b05fd2a991fed742a18b87e65" UNIQUE ("secondary_email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_bookmarks" ("user_id" SERIAL NOT NULL, "bookmark_id" SERIAL NOT NULL, CONSTRAINT "PK_6233eaaf9b84f2deb4cbe9a41a7" PRIMARY KEY ("user_id", "bookmark_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "bookmark" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "display_name" character varying(250) NOT NULL, "entity_object_id" character varying(300) NOT NULL, "url" text, "email" character varying(200) NOT NULL, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_b7fbf4a865ba38a590bb9239814" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "attachment_type" character varying(250) NOT NULL, "user_attachment_id" integer, "comment_id" integer, CONSTRAINT "PK_66a772d1d00d4b52ab98856ee39" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_thread_participant" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "comment_thread_id" integer, "user_id" integer, "comment_id" integer, CONSTRAINT "PK_0f3e14318a05f06d591976731fa" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_thread" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" character varying(300) NOT NULL, "entity_type_id" integer, "user_id" integer, "community_id" integer, CONSTRAINT "PK_be68531edd9305c665090a8a389" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "message" character varying(2000), "tags" text array, "mentions" text array, "anonymous" smallint NOT NULL DEFAULT 0, "comment_thread_id" integer, "user_id" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_read_status" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "comment_id" integer, "user_id" integer, CONSTRAINT "PK_626ce191990a74c966de562a435" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "community_setting_type_enum" AS ENUM('Tag', 'Appearance', 'Lang')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "community_setting" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "description" character varying(300), "type" "community_setting_type_enum" NOT NULL, CONSTRAINT "PK_dd288f2378464b4d61fa8dae00f" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "description" character varying(250) NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "community_base_permission" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "community_id" integer, "community_setting_id" integer, "role_id" integer, CONSTRAINT "PK_c276dec4da974d95d60e734ee67" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "domain" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "community_id" integer, CONSTRAINT "PK_27e3ec3ea0ae02c8c5bceab3ba9" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "email_template" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "subject" character varying(250) NOT NULL, "body" text NOT NULL, "description" character varying(2000), "agenda_tag" text, "sender_name" character varying(250) NOT NULL, "sender_email" character varying(200) NOT NULL, CONSTRAINT "PK_c90815fd4ca9119f19462207710" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_following_content" ("user_id" SERIAL NOT NULL, "following_content_id" SERIAL NOT NULL, CONSTRAINT "PK_a6c738c9ecc9f258063236707e8" PRIMARY KEY ("user_id", "following_content_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "following_content" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "display_name" character varying(250), "entity_object_id" character varying(300) NOT NULL, "url" text, "email" character varying(200), "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_efd2740fe6c22700761ee1eaa83" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "invite_status_code_enum" AS ENUM('Pending', 'Sent', 'NotSent', 'Failed', 'Accepted')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "invite_role_enum" AS ENUM('Admin', 'Moderator', 'User')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "invite" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(200), "email" character varying(200) NOT NULL, "invite_code" character varying(250) NOT NULL, "bounce_info" text, "invited_by_user_id" character varying(250) NOT NULL, "sender_name" character varying(300) NOT NULL, "is_sso" boolean NOT NULL, "expiry_date" TIMESTAMP WITH TIME ZONE, "is_opened" boolean NOT NULL, "is_email_link_clicked" boolean NOT NULL, "email_opened_count" integer NOT NULL, "status_code" "invite_status_code_enum" NOT NULL DEFAULT 'NotSent', "role" "invite_role_enum" NOT NULL DEFAULT 'User', "circles" text array, "invite_accepted" boolean NOT NULL, "community_id" integer, CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "password_policy" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "name" character varying(250) NOT NULL, "description" character varying(2000) NOT NULL, "min" integer, "max" integer, "required" boolean, CONSTRAINT "PK_1a82863349cfb14ac856dd5761e" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "reset_code" character varying(250) NOT NULL, "expiry_date" TIMESTAMP WITH TIME ZONE, "user_id" character varying(250) NOT NULL, CONSTRAINT "UQ_ad88301fdc79593dd222268a8b6" UNIQUE ("user_id"), CONSTRAINT "PK_8515e60a2cc41584fa4784f52ce" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "user_shortcuts" ("user_id" SERIAL NOT NULL, "shortcut_id" SERIAL NOT NULL, CONSTRAINT "PK_90082f3f46b0992aea14441de3c" PRIMARY KEY ("user_id", "shortcut_id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "shortcut" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "display_name" character varying(250) NOT NULL, "entity_object_id" character varying(300) NOT NULL, "url" text, "email" character varying(200) NOT NULL, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_2a405ef2b9a86115f3a9b7c449e" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_reference_mapping" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" character varying(300) NOT NULL, "tag_id" integer, "entity_type_id" integer, CONSTRAINT "PK_ac3f0126af7cbf6af528e0a203f" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TYPE "vote_vote_type_enum" AS ENUM('upvote', 'downvote')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "vote" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean, "updated_by" character varying(100), "created_by" character varying(100), "entity_object_id" character varying(300) NOT NULL, "vote_type" "vote_vote_type_enum" NOT NULL DEFAULT 'upvote', "user_id" integer, "entity_type_id" integer, "community_id" integer, CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "FK_b78e0aca3e3f4f697a53f52626f" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "FK_3d3dbb27b5558fe8b2f9c65ec22" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "FK_b488a6c4f68d1c4f42bdb8d90c9" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "FK_39ed6f690096855811b1fec6f92" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "FK_499740426e784c5ec98c1f5072a" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "FK_65b528d4ef4d0481bba053c1cd6" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" ADD CONSTRAINT "FK_8ea8406594f21670f256d210a94" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" ADD CONSTRAINT "FK_c1ae854d0728a99c9f88bf80c21" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_4c17c29629ed686b3b4f29905d0" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_d0be05b78e89aff4791e6189f77" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_769f4d9c24f7ea461aff88a52b2" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tags" ADD CONSTRAINT "FK_1876d8f8eff4211b216364381ec" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tags" ADD CONSTRAINT "FK_082dadc021168fef6e1afd42ad7" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "circle" ADD CONSTRAINT "FK_ad13bd82a5f9c80367bdc885ae9" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "circle" ADD CONSTRAINT "FK_3f14c243e028c5e4b4859cafb56" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "user_attachments" ADD CONSTRAINT "FK_a1ba6baf34ed9981f6d23837f99" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_attachments" ADD CONSTRAINT "FK_4fe33c60747abda30c4b3cd03ff" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_2ec0552786a9f85f4701f436380" FOREIGN KEY ("user_attachment_id") REFERENCES "user_attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_36629cc179efe369d260953cc17" FOREIGN KEY ("type_id") REFERENCES "opportunity_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" ADD CONSTRAINT "FK_7579e01505985e778e2ba0f46fa" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_a018d2ada934bea6a3b425f59ec" FOREIGN KEY ("type_id") REFERENCES "opportunity_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_978aedb01c20a25a6923686e61f" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" ADD CONSTRAINT "FK_8baecb8f647079c4ce03b354d1a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_938b0dfbabed6deaa4a9a91e919" FOREIGN KEY ("profile_image_id") REFERENCES "user_attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" ADD CONSTRAINT "FK_25d65ef3177821fbedcbce995dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" ADD CONSTRAINT "FK_d4ac960ddd4fd906304b2ffbf5b" FOREIGN KEY ("bookmark_id") REFERENCES "bookmark"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark" ADD CONSTRAINT "FK_81ca544c551c11268160ddb6e20" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark" ADD CONSTRAINT "FK_35255ddf711e828cdd4347d8719" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_attachment" ADD CONSTRAINT "FK_8011d1e141bdac4b4cbf3aa0c85" FOREIGN KEY ("user_attachment_id") REFERENCES "user_attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_attachment" ADD CONSTRAINT "FK_c1cc2987acf9dd802381c888be7" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" ADD CONSTRAINT "FK_87d2014569a7ae48fb87b33b914" FOREIGN KEY ("comment_thread_id") REFERENCES "comment_thread"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" ADD CONSTRAINT "FK_c38af2483a2882e32bd8cf9de08" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" ADD CONSTRAINT "FK_b03b1c980f4fb0baef7ec72c0bc" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" ADD CONSTRAINT "FK_9ad31d477436071ea6534f24ee7" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" ADD CONSTRAINT "FK_02782bb670ef508a6370b85eb71" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" ADD CONSTRAINT "FK_788b3323f2bb72125c503889b99" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_cfc4486b8d3b5446d81033f86c3" FOREIGN KEY ("comment_thread_id") REFERENCES "comment_thread"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_read_status" ADD CONSTRAINT "FK_1c5327b2f123cf4c3360f11852f" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_read_status" ADD CONSTRAINT "FK_847cc96ed079b6bf04a5035518d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" ADD CONSTRAINT "FK_b31fca0ff85f6eb24628f2ea6fd" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" ADD CONSTRAINT "FK_58e2650bf33e47b4b7898dc948f" FOREIGN KEY ("community_setting_id") REFERENCES "community_setting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" ADD CONSTRAINT "FK_0b9d76c2033355894a49b854b41" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" ADD CONSTRAINT "FK_716a7067b22a812df262d81b8c8" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following_content" ADD CONSTRAINT "FK_7d9efb9cb72e2ae55f02fbdd596" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following_content" ADD CONSTRAINT "FK_df0ea4ebb54f1c5d93838d28328" FOREIGN KEY ("following_content_id") REFERENCES "following_content"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "following_content" ADD CONSTRAINT "FK_c06ff2f062f685f9b08b6b0e944" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "following_content" ADD CONSTRAINT "FK_1c5a56111db4b45677ec9131228" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_90442924139218fa1799ddf700d" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_shortcuts" ADD CONSTRAINT "FK_124eeb0329ab75250d23f03a60e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_shortcuts" ADD CONSTRAINT "FK_d2730a9c89a7c53d8aeb0d68722" FOREIGN KEY ("shortcut_id") REFERENCES "shortcut"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "shortcut" ADD CONSTRAINT "FK_435462598f43926529d432bbfc1" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "shortcut" ADD CONSTRAINT "FK_3566a57145a04651173864bf8cb" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_reference_mapping" ADD CONSTRAINT "FK_de81f7ec9dc118746f20bff99db" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_reference_mapping" ADD CONSTRAINT "FK_9639725439eb241459e355b0d2d" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_af8728cf605f1988d2007d094f5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_245eca823736380963d17b6f2ed" FOREIGN KEY ("entity_type_id") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_f746849ec9067534ef88aa50a4f" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_f746849ec9067534ef88aa50a4f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_245eca823736380963d17b6f2ed"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_af8728cf605f1988d2007d094f5"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_reference_mapping" DROP CONSTRAINT "FK_9639725439eb241459e355b0d2d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_reference_mapping" DROP CONSTRAINT "FK_de81f7ec9dc118746f20bff99db"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "shortcut" DROP CONSTRAINT "FK_3566a57145a04651173864bf8cb"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "shortcut" DROP CONSTRAINT "FK_435462598f43926529d432bbfc1"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_shortcuts" DROP CONSTRAINT "FK_d2730a9c89a7c53d8aeb0d68722"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_shortcuts" DROP CONSTRAINT "FK_124eeb0329ab75250d23f03a60e"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_90442924139218fa1799ddf700d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "following_content" DROP CONSTRAINT "FK_1c5a56111db4b45677ec9131228"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "following_content" DROP CONSTRAINT "FK_c06ff2f062f685f9b08b6b0e944"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following_content" DROP CONSTRAINT "FK_df0ea4ebb54f1c5d93838d28328"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following_content" DROP CONSTRAINT "FK_7d9efb9cb72e2ae55f02fbdd596"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "domain" DROP CONSTRAINT "FK_716a7067b22a812df262d81b8c8"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" DROP CONSTRAINT "FK_0b9d76c2033355894a49b854b41"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" DROP CONSTRAINT "FK_58e2650bf33e47b4b7898dc948f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community_base_permission" DROP CONSTRAINT "FK_b31fca0ff85f6eb24628f2ea6fd"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_read_status" DROP CONSTRAINT "FK_847cc96ed079b6bf04a5035518d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_read_status" DROP CONSTRAINT "FK_1c5327b2f123cf4c3360f11852f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_cfc4486b8d3b5446d81033f86c3"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" DROP CONSTRAINT "FK_788b3323f2bb72125c503889b99"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" DROP CONSTRAINT "FK_02782bb670ef508a6370b85eb71"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread" DROP CONSTRAINT "FK_9ad31d477436071ea6534f24ee7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" DROP CONSTRAINT "FK_b03b1c980f4fb0baef7ec72c0bc"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" DROP CONSTRAINT "FK_c38af2483a2882e32bd8cf9de08"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_thread_participant" DROP CONSTRAINT "FK_87d2014569a7ae48fb87b33b914"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_attachment" DROP CONSTRAINT "FK_c1cc2987acf9dd802381c888be7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_attachment" DROP CONSTRAINT "FK_8011d1e141bdac4b4cbf3aa0c85"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark" DROP CONSTRAINT "FK_35255ddf711e828cdd4347d8719"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmark" DROP CONSTRAINT "FK_81ca544c551c11268160ddb6e20"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" DROP CONSTRAINT "FK_d4ac960ddd4fd906304b2ffbf5b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" DROP CONSTRAINT "FK_25d65ef3177821fbedcbce995dd"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_938b0dfbabed6deaa4a9a91e919"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_8baecb8f647079c4ce03b354d1a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_978aedb01c20a25a6923686e61f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity" DROP CONSTRAINT "FK_a018d2ada934bea6a3b425f59ec"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_7579e01505985e778e2ba0f46fa"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_36629cc179efe369d260953cc17"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_attachment" DROP CONSTRAINT "FK_2ec0552786a9f85f4701f436380"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_attachments" DROP CONSTRAINT "FK_4fe33c60747abda30c4b3cd03ff"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_attachments" DROP CONSTRAINT "FK_a1ba6baf34ed9981f6d23837f99"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" DROP CONSTRAINT "FK_77dbe7f2fab77d1383aaf7e67cc"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_circles" DROP CONSTRAINT "FK_10cf5024a3cbd0350d31abfda75"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "circle" DROP CONSTRAINT "FK_3f14c243e028c5e4b4859cafb56"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "circle" DROP CONSTRAINT "FK_ad13bd82a5f9c80367bdc885ae9"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tags" DROP CONSTRAINT "FK_082dadc021168fef6e1afd42ad7"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tags" DROP CONSTRAINT "FK_1876d8f8eff4211b216364381ec"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_769f4d9c24f7ea461aff88a52b2"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_d0be05b78e89aff4791e6189f77"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_4c17c29629ed686b3b4f29905d0"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" DROP CONSTRAINT "FK_c1ae854d0728a99c9f88bf80c21"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "user_communities_community" DROP CONSTRAINT "FK_8ea8406594f21670f256d210a94"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_65b528d4ef4d0481bba053c1cd6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_499740426e784c5ec98c1f5072a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_39ed6f690096855811b1fec6f92"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_b488a6c4f68d1c4f42bdb8d90c9"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_3d3dbb27b5558fe8b2f9c65ec22"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_b78e0aca3e3f4f697a53f52626f"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "vote"`, undefined);
    await queryRunner.query(`DROP TYPE "vote_vote_type_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "tag_reference_mapping"`, undefined);
    await queryRunner.query(`DROP TABLE "shortcut"`, undefined);
    await queryRunner.query(`DROP TABLE "user_shortcuts"`, undefined);
    await queryRunner.query(`DROP TABLE "password_reset"`, undefined);
    await queryRunner.query(`DROP TABLE "password_policy"`, undefined);
    await queryRunner.query(`DROP TABLE "invite"`, undefined);
    await queryRunner.query(`DROP TYPE "invite_role_enum"`, undefined);
    await queryRunner.query(`DROP TYPE "invite_status_code_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "following_content"`, undefined);
    await queryRunner.query(`DROP TABLE "user_following_content"`, undefined);
    await queryRunner.query(`DROP TABLE "email_template"`, undefined);
    await queryRunner.query(`DROP TABLE "domain"`, undefined);
    await queryRunner.query(
      `DROP TABLE "community_base_permission"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "role"`, undefined);
    await queryRunner.query(`DROP TABLE "community_setting"`, undefined);
    await queryRunner.query(
      `DROP TYPE "community_setting_type_enum"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "comment_read_status"`, undefined);
    await queryRunner.query(`DROP TABLE "comment"`, undefined);
    await queryRunner.query(`DROP TABLE "comment_thread"`, undefined);
    await queryRunner.query(
      `DROP TABLE "comment_thread_participant"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "comment_attachment"`, undefined);
    await queryRunner.query(`DROP TABLE "bookmark"`, undefined);
    await queryRunner.query(`DROP TABLE "user_bookmarks"`, undefined);
    await queryRunner.query(`DROP TABLE "user"`, undefined);
    await queryRunner.query(`DROP TYPE "user_role_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "opportunity"`, undefined);
    await queryRunner.query(`DROP TABLE "opportunity_attachment"`, undefined);
    await queryRunner.query(`DROP TABLE "user_attachments"`, undefined);
    await queryRunner.query(`DROP TABLE "opportunity_type"`, undefined);
    await queryRunner.query(`DROP TABLE "user_circles"`, undefined);
    await queryRunner.query(`DROP TYPE "user_circles_role_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "circle"`, undefined);
    await queryRunner.query(`DROP TABLE "user_tags"`, undefined);
    await queryRunner.query(`DROP TABLE "tag"`, undefined);
    await queryRunner.query(`DROP TYPE "tag_status_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "entity_type"`, undefined);
    await queryRunner.query(
      `DROP TABLE "user_communities_community"`,
      undefined,
    );
    await queryRunner.query(
      `DROP TYPE "user_communities_community_role_enum"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "community"`, undefined);
    await queryRunner.query(`DROP TYPE "community_visibility_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "tenant"`, undefined);
    await queryRunner.query(`DROP TABLE "language"`, undefined);
    await queryRunner.query(`DROP TABLE "theme"`, undefined);
  }
}

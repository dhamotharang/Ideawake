import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1607591552828 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_b78e0aca3e3f4f697a53f52626f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_3d3dbb27b5558fe8b2f9c65ec22"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "REL_b78e0aca3e3f4f697a53f52626"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "REL_3d3dbb27b5558fe8b2f9c65ec2"`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_3d3dbb27b5558fe8b2f9c65ec22"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_b78e0aca3e3f4f697a53f52626f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "REL_3d3dbb27b5558fe8b2f9c65ec2" UNIQUE ("language_id")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "REL_b78e0aca3e3f4f697a53f52626" UNIQUE ("owner_user_id")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "FK_3d3dbb27b5558fe8b2f9c65ec22" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "FK_b78e0aca3e3f4f697a53f52626f" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

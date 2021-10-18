import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1587465030286 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_499740426e784c5ec98c1f5072a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_65b528d4ef4d0481bba053c1cd6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "REL_499740426e784c5ec98c1f5072"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "REL_65b528d4ef4d0481bba053c1cd"`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_65b528d4ef4d0481bba053c1cd6"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_499740426e784c5ec98c1f5072a"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "REL_65b528d4ef4d0481bba053c1cd" UNIQUE ("owner_user_id")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "REL_499740426e784c5ec98c1f5072" UNIQUE ("tenant_id")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "FK_65b528d4ef4d0481bba053c1cd6" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "FK_499740426e784c5ec98c1f5072a" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUnnecessaryFieldTables1593190372910
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // Drop opportunity_field_data Table
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" DROP CONSTRAINT "FK_6ad762797277e393e65a83cdb1d"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" DROP CONSTRAINT "FK_6ed0b8de6a454f0e9d1a5378a7b"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_field_data" DROP CONSTRAINT "FK_c6eec4eb303d366c240e53de9ce"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opportunity_field_data"`, undefined);

    // Drop opportunity_type_field Table
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" DROP CONSTRAINT "FK_9cfd949eba4d1859eff51088d0f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" DROP CONSTRAINT "FK_44370170a8c933bb4d6a57f82aa"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunity_type_field" DROP CONSTRAINT "FK_fbc5085a31c1061745ebfb583f2"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "opportunity_type_field"`, undefined);
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    // No need for any down methodology.
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdates1597096423001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE opportunity RENAME COLUMN work_flow_id TO workflow_id`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE opportunity RENAME COLUMN workflow_id to work_flow_id`,
      undefined,
    );
  }
}

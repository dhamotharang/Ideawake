import { MigrationInterface, QueryRunner } from 'typeorm';
import uuid = require('uuid');
export class AddCommunitySlug1600232924177 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const communities = await queryRunner.query(
      `SELECT * FROM public.community;`,
      undefined,
    );
    for (const iterator of communities) {
      await queryRunner.query(
        `UPDATE public.community
                SET community_slug = '${uuid()}' WHERE id = ${iterator.id};`,
        undefined,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.community
              SET community_slug = null;`,
      undefined,
    );
  }
}

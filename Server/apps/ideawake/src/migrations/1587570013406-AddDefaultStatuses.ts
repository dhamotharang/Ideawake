import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_STATUSES } from '../common/constants/defaults';

export class AddDefaultStatuses1587570013406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    for (const status of DEFAULT_STATUSES) {
      await queryRunner.query(
        `INSERT INTO public.status(title, description, color_code, order_number, unique_id, is_deleted, community_id)
          SELECT '${status.title}', '${status.description}', '${status.colorCode}', ${status.orderNumber} ,
            '${status.uniqueId}', ${status.isDeleted}, id FROM public.community;`,
        undefined,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DELETE FROM public.status;`, undefined);
  }
}

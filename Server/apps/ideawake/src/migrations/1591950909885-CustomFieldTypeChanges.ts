import { MigrationInterface, QueryRunner } from 'typeorm';
import { TABLES } from '../common/constants/constants';
import { map } from 'lodash';

export class CustomFieldTypeChanges1591950909885 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const data = await queryRunner.query(
      `SELECT * FROM public.${TABLES.CUSTOM_FIELD_TYPE} WHERE abbreviation='community_group'`,
      undefined,
    );
    if (data.length) {
      const data1 = await queryRunner.query(
        `SELECT * FROM public.${TABLES.CUSTOM_FIELD} WHERE ${TABLES.CUSTOM_FIELD}.custom_field_type_id=${data[0].id}`,
        undefined,
      );
      if (data1.length) {
        const ids = map(data1, 'id');

        await queryRunner.query(
          `DELETE FROM public.${TABLES.OPPORTUNITY_TYPE_FIELD} WHERE ${TABLES.OPPORTUNITY_TYPE_FIELD}.field_id IN (${ids})`,
          undefined,
        );
      }
      await queryRunner.query(
        `DELETE FROM public.${TABLES.CUSTOM_FIELD} WHERE ${TABLES.CUSTOM_FIELD}.custom_field_type_id=${data[0].id}`,
        undefined,
      );
    }
    await queryRunner.query(
      `DELETE FROM public.${TABLES.CUSTOM_FIELD_TYPE} WHERE abbreviation='community_group'`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE public.${TABLES.CUSTOM_FIELD_TYPE} SET title='Community User or Group',abbreviation='community_user_or_group' WHERE abbreviation='community_user'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE public.${TABLES.CUSTOM_FIELD_TYPE} SET title='Community User',abbreviation='community_user' WHERE abbreviation='community_user_or_group'`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.${TABLES.CUSTOM_FIELD_TYPE}(
        title, abbreviation, description, category, icon)
        VALUES ('Community Group','community_group','','user_fields','users')`,
      undefined,
    );
  }
}

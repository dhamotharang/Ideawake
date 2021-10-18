import { MigrationInterface, QueryRunner } from 'typeorm';
import { TABLES } from '../common/constants/constants';
export class AddCustomFieldTypes1591710554013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.${TABLES.CUSTOM_FIELD_TYPE}(
                      title, abbreviation, description, category, icon)
                      VALUES ('Community User','community_user','','user_fields','user'),
                      ('User Skills / Tags','user_skills_tags','','user_fields','tag'),
                      ('Community Group','community_group','','user_fields','users'),
                      ('Single Line Text','single_line_text','','collect_information','font'),
                      ('Multi Line Text','multi_line_text','','collect_information','align-justify'),
                      ('Rich Text','rich_text','','collect_information','h1'),
                      ('Single Select','single_select','','choosing','clipboard-check'),
                      ('Multi Select','multi_select','','choosing','ballot-check'),
                      ('Datepicker','datepicker','','choosing','calendar-alt'),
                      ('Projected Benefits','projected_benefits','','benefits_costs_and_resources','calculator-alt'),
                      ('Projected Costs','projected_costs','','benefits_costs_and_resources','calculator-alt'),
                      ('Actual Benefits','actual_benefits','','benefits_costs_and_resources','gem'),
                      ('Actual Costs','actual_costs','','benefits_costs_and_resources','gem'),
                      ('Number','number','','values','calculator-alt'),
                      ('Calculated Field','calculated_field','','values','calculator'),
                      ('File Upload','file_upload','','uploads','file'),
                      ('Video Upload','video_upload','','uploads','video'),
                      ('Image Upload','image_upload','','uploads','image')`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.${TABLES.CUSTOM_FIELD_TYPE};`,
      undefined,
    );
  }
}

import { head } from 'lodash';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingSettingsForNoToolStages1601541682341
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // Getting stage Ids with missing assingee settings.
    const missingAssingeeStages = await queryRunner.query(
      `SELECT st.* FROM public.stage st
        LEFT JOIN public.stage_assignee_settings settings ON st.id = settings.entity_object_id AND settings.entity_type_id = (
          SELECT et.id FROM public.entity_type et WHERE et.abbreviation = 'stage'
        )
        WHERE settings.id ISNULL AND st.action_item_id IN (
          SELECT ai.id FROM public.action_item ai WHERE ai.abbreviation != 'no_tool'
        )`,
    );

    // Getting stage entity type.
    const stageEntityType = head(
      await queryRunner.query(
        `SELECT * FROM public.entity_type et WHERE et.abbreviation = 'stage'`,
      ),
    );

    // Inserting missing assignee settings.
    if (missingAssingeeStages.length) {
      const assigneeSetTypes = ['assignee', 'visibility'];
      let assigneeSettings = '';
      missingAssingeeStages.forEach((stage, index) => {
        assigneeSetTypes.forEach((type, typeIndex) => {
          assigneeSettings += `${index || typeIndex ? ', ' : ''}(${stage.id},
          ${stageEntityType['id']}, false, ${stage.community_id}, '${type}')`;
        });
      });

      await queryRunner.query(
        `INSERT INTO public.stage_assignee_settings (entity_object_id, entity_type_id, is_deleted, community_id, settings_type)
        VALUES ${assigneeSettings}`,
      );
    }

    // Inserting missing assignment settings.
    await queryRunner.query(
      `INSERT INTO public.stage_assignment_settings
        (entity_object_id,entity_type_id, is_deleted, title, instructions, stage_time_limit, completion_time_limit, community_id)
        SELECT st.id, ${stageEntityType['id']}, false, '', '', 7, 30, st.community_id
        FROM public.stage st
        LEFT JOIN public.stage_assignment_settings settings ON st.id = settings.entity_object_id AND settings.entity_type_id = (
          SELECT et.id FROM public.entity_type et WHERE et.abbreviation = 'stage'
        )
        WHERE settings.id ISNULL AND st.action_item_id IN (
          SELECT ai.id FROM public.action_item ai WHERE ai.abbreviation != 'no_tool'
        )`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    //There's no going back!
  }
}

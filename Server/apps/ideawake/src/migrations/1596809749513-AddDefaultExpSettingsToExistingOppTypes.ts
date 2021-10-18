import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultExpSettingsToExistingOppTypes1596809749513
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_experience_setting(allow_opportunity_ownership, allow_opportunity_teams, allow_opportunity_cosubmitters, community_id, entity_object_id, entity_type_id)
        SELECT true, true, true, opptype.community_id, opptype.id, (SELECT id FROM public.entity_type etype WHERE etype.abbreviation = 'opportunity_type')
        FROM public.opportunity_type opptype
        WHERE opptype.id NOT IN (
          SELECT expset.entity_object_id FROM public.entity_experience_setting expset
          WHERE expset.entity_type_id = (
          SELECT id FROM public.entity_type etype WHERE etype.abbreviation = 'opportunity_type'
          )
        );`,
      undefined,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    // There's no going back!
  }
}

import { get, groupBy, head, map, uniq } from 'lodash';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChallengeDefSubForm1615195429979 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // Getting all challenges.
    const challenges = await queryRunner.query(
      `SELECT * FROM public.challenge;`,
    );

    if (get(challenges, 'length')) {
      // Getting all challenge and opportunity type's entity types.
      const oppTypeEntityType = head(
        await queryRunner.query(
          `SELECT * FROM public.entity_type WHERE abbreviation='opportunity_type';`,
        ),
      );
      const chlngEntityType = head(
        await queryRunner.query(
          `SELECT * FROM public.entity_type WHERE abbreviation='challenge';`,
        ),
      );

      const oppTypeIds = uniq(map(challenges, 'opportunity_type_id'));

      // Getting integrated custom fields for submission form with existing
      // challenges.
      const chlngSubForm = await queryRunner.query(
        `SELECT * FROM public.custom_field_integration
          WHERE entity_object_id IN (${map(challenges, 'id')})
          AND entity_type_id=${chlngEntityType['id']}
          AND visibility_experience='submission_form';`,
      );
      const chlngIdsWithFields = uniq(map(chlngSubForm, 'entity_object_id'));

      // Getting integrated custom fields for submission form with opportunity
      // types.
      const oppTypeSubForm = await queryRunner.query(
        `SELECT * FROM public.custom_field_integration
          WHERE entity_object_id IN (${oppTypeIds})
          AND entity_type_id=${oppTypeEntityType['id']}
          AND visibility_experience='submission_form';`,
      );
      const subFormByOppType = groupBy(oppTypeSubForm, 'entity_object_id');

      // Adding opportunity type's integrated fields with challenges.
      for (const challenge of challenges) {
        if (!chlngIdsWithFields.includes(challenge.id)) {
          const typeIntegratedFields = get(
            subFormByOppType,
            challenge.opportunity_type_id,
          );
          if (get(typeIntegratedFields, 'length')) {
            for (const intField of typeIntegratedFields) {
              await queryRunner.query(
                `INSERT INTO public.custom_field_integration(entity_object_id, entity_type_id, community_id, field_id, "order", visibility_experience)
                VALUES (${challenge.id}, ${chlngEntityType['id']}, ${challenge.community_id}, ${intField.field_id}, ${intField.order}, 'submission_form');`,
              );
            }
          }
        }
      }
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    // There's no going back!
  }
}

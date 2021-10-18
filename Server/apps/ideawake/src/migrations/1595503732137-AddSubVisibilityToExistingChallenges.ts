import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubVisibilityToExistingChallenges1595503732137
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.entity_visibility_setting("public", entity_type_id, entity_object_id)
        SELECT true, (SELECT id FROM public.entity_type etype WHERE etype.abbreviation = 'challenge'), ch.id FROM public.challenge ch
        WHERE ch.id NOT IN (
          SELECT ev.entity_object_id FROM public.entity_visibility_setting ev
          WHERE ev.entity_type_id = (
            SELECT id FROM public.entity_type etype WHERE etype.abbreviation = 'challenge'
          )
        )`,
      undefined,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<any> {
    // There's no going back!
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStageNotificationSettings1587570008841
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.stage_notification_setting(title, abbreviation)
        VALUES ('Submitter and Co-Submitters', 'submitter_and_co_submitters'),
          ('Opportunity Owner', 'opportunity_owner'),
          ('Team Members', 'team_members'),
          ('Followers', 'followers'),
          ('Voters', 'voters'),
          ('Specific Individuals or Groups', 'specific_individuals_or_groups');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.stage_notification_setting;`,
      undefined,
    );
  }
}

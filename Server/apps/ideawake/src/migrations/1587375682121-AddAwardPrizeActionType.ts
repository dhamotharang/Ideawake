import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAwardPrizeActionType1587375682121
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_type(
                id,name, abbreviation)
                VALUES (17,'AwardPrize', 'award_prize');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'AwardPrize';`,
      undefined,
    );
  }
}

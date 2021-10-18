import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActionTypes1585662228645 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (1,'Follow', 'follow');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (2,'Upvote', 'upvote');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (3,'Edit', 'edit');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (4,'Comment', 'comment');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (5,'Post', 'post');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (6,'Bookmark', 'bookmark');`,
      undefined,
    );

    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
            VALUES (7,'Mention', 'mention');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (8,'View', 'view');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
        id,name, abbreviation)
        VALUES (9,'Share', 'share');`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO public.action_type(
          id,name, abbreviation)
          VALUES (10,'AcceptInvite', 'accept_invite');`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Follow';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Upvote';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Edit';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Comment';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Post';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Bookmark';`,
      undefined,
    );

    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Mention';`,
      undefined,
    );
    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'View';`,
      undefined,
    );

    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'Share';`,
      undefined,
    );

    await queryRunner.query(
      `DELETE FROM public.action_type where name = 'AcceptInvite';`,
      undefined,
    );
  }
}

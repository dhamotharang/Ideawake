import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { UserEntity } from '../user/user.entity';
import { BookmarkedViewTypeEnum } from '../../enum';

@Entity(TABLES.BOOKMARKED_VIEW)
export class BookmarkedViewEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'text' })
  bookmarkedUrl: string;

  @Column({
    type: 'enum',
    enum: BookmarkedViewTypeEnum,
    default: BookmarkedViewTypeEnum.TABLE,
  })
  viewType: BookmarkedViewTypeEnum;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true, type: 'json' })
  filterOptions: {};

  @Column({ nullable: true, type: 'json' })
  columnOptions: {};

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @RelationId((bookmark: BookmarkedViewEntity) => bookmark.user)
  userId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((bookmark: BookmarkedViewEntity) => bookmark.community)
  communityId: number;
}

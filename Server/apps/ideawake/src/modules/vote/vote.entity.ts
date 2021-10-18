import { CommonEntity } from './../../common/common.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { CommunityEntity } from '../community/community.entity';
import { VoteType } from '../../enum';

@Entity(TABLES.VOTE)
export class VoteEntity extends CommonEntity {
  // Relation
  @ManyToOne(() => UserEntity, ue => ue.id)
  @JoinColumn()
  user: UserEntity;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;

  @Column({
    type: 'enum',
    enum: VoteType,
    default: VoteType.UPVOTE,
  })
  voteType: VoteType;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @RelationId((vote: VoteEntity) => vote.entityType)
  entityTypeId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((vote: VoteEntity) => vote.community)
  communityId: number;
}

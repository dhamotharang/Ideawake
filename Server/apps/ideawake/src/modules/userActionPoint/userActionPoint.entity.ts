import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { ActionTypeEntity } from '../actionType/actionType.entity';
import { UserEntity } from '../user/user.entity';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';

@Entity(TABLES.USER_ACTION_POINT)
export class UserActionPointEntity extends CommonEntity {
  @ManyToOne(() => ActionTypeEntity)
  @JoinColumn()
  actionType: ActionTypeEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @Column({
    nullable: true,
  })
  entityObjectId: number;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({ type: 'int' })
  experiencePoint;

  @Column({
    nullable: true,
  })
  actionEntityObjectId: number;

  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  actionEntityType: EntityTypeEntity;
}

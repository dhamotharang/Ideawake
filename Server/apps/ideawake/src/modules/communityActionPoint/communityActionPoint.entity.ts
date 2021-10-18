import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { ActionTypeEntity } from '../actionType/actionType.entity';
// import { RoleEntity } from '../role/role.entity';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';

@Entity(TABLES.COMMUNITY_ACTION_POINT)
export class CommunityActionPointEntity extends CommonEntity {
  @ManyToOne(() => ActionTypeEntity)
  @JoinColumn()
  actionType: ActionTypeEntity;

  //   @ManyToOne(() => RoleEntity)
  //   @JoinColumn()
  //   role: RoleEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({ type: 'int' })
  experiencePoint;

  @Column({ type: 'int', nullable: true })
  reputePoint;
}

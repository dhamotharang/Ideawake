import { CommonEntity } from '../../common/common.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.SHARE)
export class ShareEntity extends CommonEntity {
  @Column({
    type: 'text',
    nullable: true,
  })
  message: string;

  // Relation
  @ManyToOne(() => UserEntity, ue => ue.id)
  @JoinColumn()
  sharedWith: UserEntity;

  // Relation
  @ManyToOne(() => UserEntity, ue => ue.id)
  @JoinColumn()
  sharedBy: UserEntity;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserTags } from './user.tag.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { UserEntity } from '../user/user.entity';
import { TagStatus } from './../../enum/tag-status.enum';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.TAG)
export class TagEntity extends CommonEntity {
  @Column({ unique: true, type: 'varchar', length: 250 })
  name: string;

  @OneToMany(() => UserTags, ut => ut.tag)
  tagUsers: UserTags[];

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;

  // Relation
  @ManyToOne(() => UserEntity, ue => ue.id)
  @JoinColumn()
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: TagStatus,
    default: TagStatus.ACTIVE,
  })
  status: TagStatus;

  @Column({
    nullable: false,
    type: 'smallint',
    default: 0,
  })
  isPreDefine: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

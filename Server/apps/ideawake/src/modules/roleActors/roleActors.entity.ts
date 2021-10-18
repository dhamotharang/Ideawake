import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { RoleEntity } from '../role/role.entity';
import { RoleActorTypes } from '../../enum';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.ROLE_ACTORS)
export class RoleActorsEntity extends CommonEntity {
  @ManyToOne(() => RoleEntity, { nullable: false })
  @JoinColumn()
  role: RoleEntity;

  @Column()
  roleId: number;

  @Column({
    type: 'enum',
    enum: RoleActorTypes,
    default: RoleActorTypes.USER,
  })
  actorType: RoleActorTypes;

  @Column({
    type: 'int4',
    nullable: false,
  })
  actorId: number;

  @Column({
    type: 'int4',
    nullable: true,
  })
  entityObjectId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({ nullable: true })
  entityTypeId: number;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @Column()
  communityId: number;
}

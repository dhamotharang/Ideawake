import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { UserShortcuts } from './user.shortcut.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.SHORTCUT)
export class ShortcutEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  displayName: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  entityType: EntityTypeEntity;

  // Entity Relation
  @OneToMany(() => UserShortcuts, us => us.shortcut)
  userShortcuts: UserShortcuts;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @Column({
    type: 'text',
    nullable: true,
  })
  url: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;
}

import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { RoleLevelEnum } from '../../enum/role-level.enum';

@Entity(TABLES.ROLE)
export class RoleEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'varchar', length: 250 })
  description: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  abbreviation: string;

  @Column({
    type: 'enum',
    enum: RoleLevelEnum,
    default: RoleLevelEnum.community,
  })
  level: RoleLevelEnum;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

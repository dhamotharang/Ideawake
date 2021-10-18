import { CommunityEntity } from './../community/community.entity';
import { CommonEntity } from './../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.DOMAIN)
export class DomainEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @ManyToOne(() => CommunityEntity, community => community.id)
  @JoinColumn()
  community: Promise<CommunityEntity>;
}

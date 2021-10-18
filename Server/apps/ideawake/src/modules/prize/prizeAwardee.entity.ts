import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { UserEntity } from '../user/user.entity';
import { PrizeEntity } from './prize.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.PRIZE_AWARDEE)
export class PrizeAwardeeEntity extends CommonEntity {
  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'int4',
    nullable: false,
  })
  entityObjectId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column({ nullable: true, type: 'varchar', length: 2000 })
  message: string;

  @ManyToOne(() => PrizeEntity)
  @JoinColumn()
  prize: PrizeEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

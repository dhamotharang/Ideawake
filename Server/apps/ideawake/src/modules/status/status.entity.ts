import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { StageEntity } from '../stage/stage.entity';

@Entity(TABLES.STATUS)
@Unique(['uniqueId', 'community'])
export class StatusEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ nullable: true, type: 'varchar', length: 2000 })
  description: string;

  @Column({ type: 'varchar', length: 250 })
  colorCode: string;

  @Column({
    type: 'int8',
  })
  orderNumber: number;

  @Column({ type: 'varchar', length: 250 })
  uniqueId: string;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @OneToMany(() => StageEntity, stage => stage.status)
  stages: StageEntity[];
}

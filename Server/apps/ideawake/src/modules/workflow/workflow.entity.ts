import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.WORKFLOW)
export class WorkflowEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ nullable: true, type: 'varchar', length: 2000 })
  description: string;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((workflow: WorkflowEntity) => workflow.community)
  communityId: number;

  @Column({ type: 'text', nullable: true })
  oldPlatformId: string;
}

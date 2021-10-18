import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { StageEmailReminderEnum } from '../../enum/stage-email-reminder.enum';

@Entity(TABLES.STAGE_ASSIGNMENT_SETTINGS)
export class StageAssignmentSettingsEntity extends CommonEntity {
  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({ type: 'integer' })
  entityObjectId: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  instructions: string;

  @Column({ type: 'integer', nullable: true })
  stageTimeLimit: number;

  @Column({
    default: false,
  })
  emailNotification: boolean;

  @Column({
    type: 'enum',
    enum: StageEmailReminderEnum,
    default: StageEmailReminderEnum.NEVER,
  })
  emailReminder: StageEmailReminderEnum;

  @Column({
    default: true,
  })
  stageComments: boolean;

  @Column({
    default: true,
  })
  allAssigneesCompleted: boolean;

  @Column({ type: 'integer', nullable: true })
  minimumResponses: number;

  @Column({ type: 'integer', nullable: true })
  completionTimeLimit: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

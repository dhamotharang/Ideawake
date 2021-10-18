import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  AfterInsert,
  getConnection,
  Index,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { UserEntity } from '../user/user.entity';
import { OpportunityTypeEntity } from '../opportunityType/opportunityType.entity';
import { OpportunityAttachmentEntity } from '../opportunityAttachment/opportunityAttachment.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { ChallengeEntity } from '../challenge/challenge.entity';
import { OpportunityUserEntity } from '../opportunityUser/opportunityUser.entity';
import { StageEntity } from '../stage/stage.entity';
import { WorkflowEntity } from '../workflow/workflow.entity';
import { CustomFieldDataEntity } from '../customField/customFieldData.entity';
@Entity(TABLES.OPPORTUNITY)
@Index(['challenge', 'community'])
export class OpportunityEntity extends CommonEntity {
  @Column({ type: 'text' })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: false })
  draft: boolean;

  //Category

  @Column('numeric', { array: true, nullable: true, default: () => "'{}'" })
  tags: [];

  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  mentions: number[];

  @ManyToOne(() => OpportunityTypeEntity, { nullable: false })
  @JoinColumn()
  opportunityType: OpportunityTypeEntity;

  @Column()
  opportunityTypeId: number;

  @Index()
  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @Column()
  communityId: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity;

  @Column()
  userId: number;

  @OneToMany(
    () => OpportunityAttachmentEntity,
    oppAttachments => oppAttachments.opportunity,
  )
  opportunityAttachments: OpportunityAttachmentEntity[];

  @Column({
    nullable: false,
    type: 'smallint',
    default: 0,
  })
  anonymous: number;

  @Column({
    nullable: false,
    type: 'int8',
    default: 0,
  })
  viewCount: number;

  @OneToMany(() => OpportunityUserEntity, ou => ou.opportunity)
  opportunityUsers: OpportunityUserEntity[];

  @AfterInsert()
  generateId = async () => {
    if (this.tags.length) {
      const dataEntityType = await getConnection()
        .createQueryBuilder()
        .select('entityType')
        .from(EntityTypeEntity, 'entityType')
        .where('entityType.abbreviation = :abbreviation', {
          abbreviation: `idea`,
        })
        .getOne();
      const data = [];
      for (const iterator of this.tags) {
        data.push({
          tag: iterator,
          entityObjectId: this.id,
          entityType: dataEntityType.id,
        });
      }
      // await getConnection()
      //   .createQueryBuilder()
      //   .select(TABLES.TAG_REFERENCE_MAPPING)
      //   .from(TABLES.TAG_REFERENCE_MAPPING, 'tag_map')
      //   .where('tag_map.tag = :tag', { tag: `tagId` })
      //   .andWhere('tag_map.id = :id', { id: 1 })
      //   .getOne();
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(TABLES.TAG_REFERENCE_MAPPING)
        .values(data)
        .execute();
    }
  };

  @Index()
  @ManyToOne(() => ChallengeEntity)
  @JoinColumn()
  challenge: ChallengeEntity;

  @Column({ nullable: true })
  challengeId: number;

  @ManyToOne(() => StageEntity)
  @JoinColumn()
  stage: StageEntity;

  @Column({ nullable: true })
  stageId: number;

  @ManyToOne(() => WorkflowEntity)
  @JoinColumn()
  workflow: WorkflowEntity;

  @Column({ nullable: true })
  workflowId: number;

  @Column({ type: 'timestamptz', nullable: true })
  stageAttachmentDate: Date;

  @OneToMany(
    () => CustomFieldDataEntity,
    customFieldDataEntity => customFieldDataEntity.opportunity,
  )
  customFieldDataEntity: CustomFieldDataEntity[];

  @Column({ type: 'text', nullable: true })
  oldPlatformId: string;

  @Column({ nullable: true, type: 'float' })
  currStageScore: number;

  @Column({ nullable: true, type: 'float' })
  totalScore: number;
}

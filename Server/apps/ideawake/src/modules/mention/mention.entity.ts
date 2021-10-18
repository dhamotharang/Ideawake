import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { CommunityEntity } from '../community/community.entity';
import { MentionObjectTypeEnum } from '../../enum/mention-object-type.enum';

@Entity(TABLES.MENTION)
export class MentionEntity extends CommonEntity {
  @Column({ type: 'int4' })
  mentionedObjectId: number;

  @Column({
    type: 'enum',
    enum: MentionObjectTypeEnum,
    default: MentionObjectTypeEnum.USER,
  })
  mentionedObjectType: MentionObjectTypeEnum;

  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'int4' })
  entityObjectId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

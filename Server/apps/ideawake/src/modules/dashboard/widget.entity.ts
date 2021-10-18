import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, RelationId, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { WidgetTypeEnum } from '../../enum/widget-type.enum';
import { DashboardEntity } from './dashboard.entity';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';

@Entity(TABLES.WIDGET)
export class WidgetEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250, nullable: true })
  title: string;

  @Column({ nullable: false, type: 'json' })
  configData: {};

  @Column({ type: 'enum', enum: WidgetTypeEnum, default: WidgetTypeEnum.PIE })
  widgetType: WidgetTypeEnum;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((widgetEntity: WidgetEntity) => widgetEntity.community)
  communityId: number;

  @ManyToOne(() => DashboardEntity)
  @JoinColumn()
  dashboard: DashboardEntity;

  @RelationId((widgetEntity: WidgetEntity) => widgetEntity.dashboard)
  dashboardId: number;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  entityType: EntityTypeEntity;

  @RelationId((widgetEntity: WidgetEntity) => widgetEntity.entityType)
  entityTypeId: number;
}

import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { AuthTypeEnum } from '../../enum';

@Entity(TABLES.AUTH_INTEGRATION)
export class AuthIntegrationEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  authProvider: string;

  @Column({ type: 'enum', enum: AuthTypeEnum, default: AuthTypeEnum.SAML })
  authType: AuthTypeEnum;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  loginUrl: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  clientId: string;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((integration: AuthIntegrationEntity) => integration.community)
  communityId: number;
}

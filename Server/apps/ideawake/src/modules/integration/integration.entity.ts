import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Generated,
  RelationId,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { AuthorizedWith } from '../../enum/authorized-with.enum';
import { CommunityEntity } from '../community/community.entity';
import { UserEntity } from '../user/user.entity';

@Entity(TABLES.INTEGRATION)
export class IntegrationEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  appName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  redirectUrl: string;

  @Column()
  @Generated('uuid')
  clientId: string;

  @Column()
  @Generated('uuid')
  clientSecret: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @RelationId((integration: IntegrationEntity) => integration.user)
  userId: number;

  @Column({ type: 'text', nullable: true })
  token: string;

  @Column({
    type: 'enum',
    enum: AuthorizedWith,
    default: AuthorizedWith.IDEAWAKE,
  })
  authorizeWith: AuthorizedWith;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((integration: IntegrationEntity) => integration.user)
  communityId: number;

  @Column('text', { nullable: true, select: false })
  refreshToken: string;
}

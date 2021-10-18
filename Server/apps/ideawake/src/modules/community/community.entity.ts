import { UserEntity } from './../user/user.entity';
import { TenantEntity } from './../tenant/tenant.entity';
import { ThemeEntity } from './../theme/theme.entity';
import { CommonEntity } from './../../common/common.entity';
import { CommunityAppearanceSettingEntity } from './../communityAppearanceSetting/communityAppearanceSetting.entity';
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  // ManyToMany,
  // JoinTable,
  OneToMany,
  ManyToOne,
  BeforeInsert,
  RelationId,
} from 'typeorm';
import { UserCommCommunities } from '../user/userCommunityCommunities.entity';
import { TABLES } from '../../common/constants/constants';
import {
  CommunitySSOLoginEnum,
  CommunityVisibility,
  LanguageAbbreviations,
} from '../../enum';
import { AuthIntegrationEntity } from '../integration/authIntegration.entity';
import uuid = require('uuid');
@Entity({ name: TABLES.COMMUNITY })
export class CommunityEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 350 })
  name: string;

  @Column({ type: 'varchar', length: 2000 })
  description: string;

  @Column({ unique: true, type: 'varchar', length: 150 })
  url: string;

  @Column({
    type: 'enum',
    enum: CommunityVisibility,
    default: CommunityVisibility.PRIVATE,
  })
  visibility: CommunityVisibility;

  @Column({ type: 'simple-json', nullable: true })
  s3Settings: {}; // need to define what props s3Settings can have

  @Column({ type: 'varchar', length: 1000, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  emailLogo: string;

  @Column({
    type: 'enum',
    enum: LanguageAbbreviations,
    default: LanguageAbbreviations.ENGLISH,
  })
  defaultLanguage: LanguageAbbreviations;

  @Column({
    default: false,
  })
  isTranslation: boolean;

  @Column()
  isOpen: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salt: string;

  @Column({ type: 'timestamptz' })
  lastLogin: Date;

  @Column({
    type: 'enum',
    enum: CommunitySSOLoginEnum,
    default: CommunitySSOLoginEnum.DISABLED,
  })
  loginWithSSO: CommunitySSOLoginEnum;

  @OneToOne(() => ThemeEntity)
  @JoinColumn()
  theme: ThemeEntity;

  @OneToOne(() => CommunityAppearanceSettingEntity, cas => cas.community)
  communityAppearanceSetting: CommunityAppearanceSettingEntity;

  @ManyToOne(() => TenantEntity)
  @JoinColumn()
  tenant: TenantEntity;

  @RelationId((community: CommunityEntity) => community.tenant)
  tenantId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  ownerUser: UserEntity;

  // @ManyToMany(() => UserEntity, user => user.communities, { cascade: true })
  // @JoinTable()
  // users: UserEntity[];

  @OneToMany(() => UserCommCommunities, uc => uc.community)
  communityUsers: UserCommCommunities[];

  @OneToMany(() => AuthIntegrationEntity, ait => ait.community)
  authIntegration: AuthIntegrationEntity[];

  @Column({ type: 'text', nullable: true })
  communitySlug: string;

  @BeforeInsert()
  updateCommunitySlug() {
    this.communitySlug = uuid();
  }
}

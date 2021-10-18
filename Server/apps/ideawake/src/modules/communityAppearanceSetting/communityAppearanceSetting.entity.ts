import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.COMMUNITY_APPEARANCE_SETTING)
export class CommunityAppearanceSettingEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  defaultLogo: string;

  @Column({ type: 'varchar', length: 250 })
  mobileLogo: string;

  @Column({ type: 'varchar', length: 250 })
  favicon: string;

  @Column({ type: 'varchar', length: 250 })
  emailFeaturedImage: string;

  @Column({ type: 'varchar', length: 250 })
  primaryColor: string;

  @Column({ type: 'varchar', length: 250 })
  accentColor: string;

  @Column({ type: 'varchar', length: 250 })
  navigationBackgroundColor: string;

  @Column({ type: 'varchar', length: 250 })
  navigationTextColor: string;

  @Column({ type: 'varchar', length: 250 })
  footerBackgroundColor: string;

  @Column({ type: 'varchar', length: 250 })
  footerTextColor: string;

  @Column({ type: 'varchar', length: 250 })
  jumbotronBackgroundImage: string;

  @Column({ type: 'text' })
  jumbotronPageTitle: string;

  @Column({ type: 'text' })
  jumbotronPageDescription: string;

  @OneToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}

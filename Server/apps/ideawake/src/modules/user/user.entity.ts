// import { CommunityEntity } from './../community/community.entity';
import { CommonEntity } from './../../common/common.entity';
import {
  Column,
  Entity,
  // ManyToMany,
  // JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PasswordTransformer } from './password.transformer';
import { UserCommCommunities } from './userCommunityCommunities.entity';
import { UserTags } from '../tag/user.tag.entity';
import { UserCircles } from './user.circles.entity';
import { TABLES } from '../../common/constants/constants';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { UserAttachmentEntity } from '../userAttachment/userAttachment.entity';
import { LanguageAbbreviations } from '../../enum';
@Entity({ name: TABLES.USER })
export class UserEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 200 })
  firstName: string;

  @Column({ type: 'varchar', length: 200 })
  lastName: string;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  userName: string;

  @Column({ unique: true, type: 'varchar', length: 200 })
  email: string;

  @Column({ unique: true, nullable: true, type: 'varchar', length: 200 })
  secondaryEmail: string;

  @Column({
    type: 'varchar',
    length: 300,
    transformer: new PasswordTransformer(),
    select: false,
    nullable: true,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
    select: false,
  })
  oldPassword: string;

  @Column({ nullable: true, type: 'varchar', length: 100, select: false })
  salt: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastLogin: Date;

  // @ManyToMany(() => CommunityEntity, community => community.users)
  // @JoinTable()
  // communities: CommunityEntity[];

  @OneToMany(() => UserCommCommunities, uc => uc.user)
  userCommunities: UserCommCommunities[];

  @OneToMany(() => UserTags, ut => ut.user)
  userTags: UserTags[];

  @OneToMany(() => UserCircles, uc => uc.user)
  userCircles: UserCircles[];

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => UserAttachmentEntity)
  @JoinColumn()
  profileImage: UserAttachmentEntity;

  @Column({ nullable: true })
  profileBio: string;

  @Column('text', { array: true, nullable: true })
  skills: [];

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  timeZone: string;

  @Column('text', { array: true, nullable: true })
  latLng: [];

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  company: string;

  @OneToMany(() => OpportunityEntity, opportunities => opportunities.user)
  opportunities: OpportunityEntity[];

  @Column('text', { nullable: true, select: false })
  refreshToken: string;

  @Column({
    type: 'enum',
    enum: LanguageAbbreviations,
    default: LanguageAbbreviations.ENGLISH,
  })
  language: LanguageAbbreviations;

  @Column('boolean', { default: false })
  isPending: boolean;
}

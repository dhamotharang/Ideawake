import { CommunityEntity } from '../community/community.entity';
import { CommonEntity } from '../../common/common.entity';
import { UserEntity } from '../user/user.entity';
import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserCircles } from '../user/user.circles.entity';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.CIRCLE)
export class CircleEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  displayName: string;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  type: string;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: Promise<UserEntity>;

  @Column({ type: 'varchar', length: 300, nullable: true })
  parentCircleId: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({
    nullable: true,
  })
  pinnedToShortcut: boolean;

  @OneToMany(() => UserCircles, uc => uc.circle)
  circleUsers: UserCircles[];
}

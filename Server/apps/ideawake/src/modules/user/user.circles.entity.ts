import { CircleEntity } from '../circle/circle.entity';
import { UserEntity } from './user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../../enum/user-role.enum';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.USER_CIRCLES)
export class UserCircles {
  @ManyToOne(() => UserEntity, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id', primary: true, nullable: false })
  userId: number;

  @ManyToOne(() => CircleEntity, circle => circle.id)
  @JoinColumn({ name: 'circle_id' })
  circle: CircleEntity;

  @Column({ name: 'circle_id', primary: true, nullable: false })
  circleId: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

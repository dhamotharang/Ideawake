import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { UserCircles } from './user.circles.entity';

@EntityRepository(UserCircles)
export class UserCircleRepository extends Repository<UserCircles> {}

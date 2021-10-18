import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { UserCommCommunities } from './userCommunityCommunities.entity';

@EntityRepository(UserCommCommunities)
export class UserCommunityRepository extends Repository<UserCommCommunities> {}

import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { FollowingContentEntity } from './followingContent.entity';

@EntityRepository(FollowingContentEntity)
export class FollowingContentRepository extends Repository<
  FollowingContentEntity
> {}

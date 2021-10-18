import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { BookmarkedViewEntity } from './bookmarkedView.entity';

@EntityRepository(BookmarkedViewEntity)
export class BookmarkedViewRepository extends Repository<
  BookmarkedViewEntity
> {}

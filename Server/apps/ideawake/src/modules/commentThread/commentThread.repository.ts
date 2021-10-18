import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommentThreadEntity } from './commentThread.entity';

@EntityRepository(CommentThreadEntity)
export class CommentThreadRepository extends Repository<CommentThreadEntity> {}

import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ActionItemEntity } from './actionItem.entity';

@EntityRepository(ActionItemEntity)
export class ActionItemRepository extends Repository<ActionItemEntity> {}

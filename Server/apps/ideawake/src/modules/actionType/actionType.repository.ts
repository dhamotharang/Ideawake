import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ActionTypeEntity } from './actionType.entity';

@EntityRepository(ActionTypeEntity)
export class ActionTypeRepository extends Repository<ActionTypeEntity> {}

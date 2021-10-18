import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { WorkflowEntity } from './workflow.entity';

@EntityRepository(WorkflowEntity)
export class WorkflowRepository extends Repository<WorkflowEntity> {}

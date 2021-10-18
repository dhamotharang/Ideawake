import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { WidgetEntity } from './widget.entity';

@EntityRepository(WidgetEntity)
export class WidgetRepository extends Repository<WidgetEntity> {}

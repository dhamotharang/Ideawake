import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ThemeEntity } from './commentReadStatus.entity';

@EntityRepository(ThemeEntity)
export class ThemeRepository extends Repository<ThemeEntity> {}

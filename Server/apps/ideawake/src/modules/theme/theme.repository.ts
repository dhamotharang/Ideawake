import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ThemeEntity } from './theme.entity';

@EntityRepository(ThemeEntity)
export class ThemeRepository extends Repository<ThemeEntity> {}

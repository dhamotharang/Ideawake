import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { LanguageEntity } from './language.entity';

@EntityRepository(LanguageEntity)
export class LanguageRepository extends Repository<LanguageEntity> {}

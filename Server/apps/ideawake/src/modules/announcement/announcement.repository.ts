import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { AnnouncementEntity } from './announcement.entity';

@EntityRepository(AnnouncementEntity)
export class AnnouncementRepository extends Repository<AnnouncementEntity> {}

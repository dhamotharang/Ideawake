import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { AnnouncementTargetingEntity } from './announcementTargeting.entity';

@EntityRepository(AnnouncementTargetingEntity)
export class AnnouncementTargetingRepository extends Repository<
  AnnouncementTargetingEntity
> {}

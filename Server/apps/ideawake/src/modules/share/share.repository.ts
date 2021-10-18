import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ShareEntity } from './share.entity';

@EntityRepository(ShareEntity)
export class ShareRepository extends Repository<ShareEntity> {}

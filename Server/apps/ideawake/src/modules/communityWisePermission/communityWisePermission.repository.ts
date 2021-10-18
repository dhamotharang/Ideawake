import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommunityWisePermissionEntity } from './communityWisePermission.entity';

@EntityRepository(CommunityWisePermissionEntity)
export class CommunityWisePermissionRepository extends Repository<
  CommunityWisePermissionEntity
> {}

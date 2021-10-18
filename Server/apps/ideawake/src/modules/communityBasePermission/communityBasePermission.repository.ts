import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommunityBasePermissionEntity } from './communityBasePermission.entity';

@EntityRepository(CommunityBasePermissionEntity)
export class CommunityBasePermissionRepository extends Repository<
  CommunityBasePermissionEntity
> {}

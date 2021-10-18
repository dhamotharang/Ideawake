import { Injectable } from '@nestjs/common';
import { CommunityWisePermissionRepository } from './communityWisePermission.repository';
import { CommunityWisePermissionEntity } from './communityWisePermission.entity';
import { NON_PERMISSION_COLUMNS } from '../../common/constants/constants';

@Injectable()
export class CommunityWisePermissionService {
  constructor(
    public readonly communityWisePermissionRepository: CommunityWisePermissionRepository,
  ) {}

  /**
   * Get communityWisePermissions
   */
  async getCommunityWisePermissions(options: {}): Promise<
    CommunityWisePermissionEntity[]
  > {
    return this.communityWisePermissionRepository.find(options);
  }

  /**
   * Add communityWisePermission
   */
  async addCommunityWisePermission(data: {}): Promise<
    CommunityWisePermissionEntity
  > {
    const communityWisePermissionCreated = this.communityWisePermissionRepository.create(
      data,
    );
    return this.communityWisePermissionRepository.save(
      communityWisePermissionCreated,
    );
  }

  /**
   * Get denied community wise permissions.
   * @returns CommunityWisePermissionEntity object with all permissions set to 0.
   */
  async getDeniedPermissions(): Promise<CommunityWisePermissionEntity> {
    const columns = this.communityWisePermissionRepository.metadata.ownColumns.map(
      c => c.propertyName,
    );
    const data = {};
    for (const column of columns) {
      if (!NON_PERMISSION_COLUMNS.includes(column)) {
        data[column] = 0;
      }
    }

    return this.communityWisePermissionRepository.create(data);
  }

  /**
   * Update communityWisePermission
   */
  async updateCommunityWisePermission(options: {}, data: {}): Promise<{}> {
    return this.communityWisePermissionRepository.update(options, data);
  }

  /**
   * Delete communityWisePermission
   */
  async deleteCommunityWisePermission(options: {}): Promise<{}> {
    return this.communityWisePermissionRepository.delete(options);
  }
}

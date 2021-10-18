import { Injectable } from '@nestjs/common';
import { CommunityBasePermissionRepository } from './communityBasePermission.repository';
import { CommunityBasePermissionEntity } from './communityBasePermission.entity';

@Injectable()
export class CommunityBasePermissionService {
  constructor(
    public readonly communityBasePermissionRepository: CommunityBasePermissionRepository,
  ) {}

  /**
   * Get communityBasePermissions
   */
  async getCommunityBasePermissions(options: {}): Promise<
    CommunityBasePermissionEntity[]
  > {
    return this.communityBasePermissionRepository.find(options);
  }

  /**
   * Add communityBasePermission
   */
  async addCommunityBasePermission(data: {}): Promise<
    CommunityBasePermissionEntity
  > {
    const communityBasePermissionCreated = this.communityBasePermissionRepository.create(
      data,
    );
    return this.communityBasePermissionRepository.save(
      communityBasePermissionCreated,
    );
  }

  /**
   * Update communityBasePermission
   */
  async updateCommunityBasePermission(options: {}, data: {}): Promise<{}> {
    return this.communityBasePermissionRepository.update(options, data);
  }

  /**
   * Delete communityBasePermission
   */
  async deleteCommunityBasePermission(options: {}): Promise<{}> {
    return this.communityBasePermissionRepository.delete(options);
  }
}

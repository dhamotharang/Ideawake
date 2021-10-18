import { Injectable } from '@nestjs/common';
import { CommunitySettingRepository } from './communitySetting.repository';
import { CommunitySettingEntity } from './communitySetting.entity';

@Injectable()
export class CommunitySettingService {
  constructor(
    public readonly communitySettingRepository: CommunitySettingRepository,
  ) {}

  /**
   * Get communitySettings
   */
  async getCommunitySettings(options: {}): Promise<CommunitySettingEntity[]> {
    return this.communitySettingRepository.find(options);
  }

  /**
   * Add communitySetting
   */
  async addCommunitySetting(data: {}): Promise<CommunitySettingEntity> {
    const communitySettingCreated = this.communitySettingRepository.create(
      data,
    );
    return this.communitySettingRepository.save(communitySettingCreated);
  }

  /**
   * Update communitySetting
   */
  async updateCommunitySetting(options: {}, data: {}): Promise<{}> {
    return this.communitySettingRepository.update(options, data);
  }

  /**
   * Delete communitySetting
   */
  async deleteCommunitySetting(options: {}): Promise<{}> {
    return this.communitySettingRepository.delete(options);
  }
}

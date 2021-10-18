import { Injectable } from '@nestjs/common';
import { CommunityAppearanceSettingRepository } from './communityAppearanceSetting.repository';
import { CommunityAppearanceSettingEntity } from './communityAppearanceSetting.entity';

@Injectable()
export class CommunityAppearanceSettingService {
  constructor(
    public readonly CommunityAppearanceSettingRepository: CommunityAppearanceSettingRepository,
  ) {}

  /**
   * Get CommunityAppearanceSettings
   */
  async getCommunityAppearanceSettings(options: {}): Promise<
    CommunityAppearanceSettingEntity[]
  > {
    return this.CommunityAppearanceSettingRepository.find(options);
  }

  /**
   * Add CommunityAppearanceSetting
   */
  async addCommunityAppearanceSetting(data: {}): Promise<
    CommunityAppearanceSettingEntity
  > {
    const CommunityAppearanceSettingCreated = this.CommunityAppearanceSettingRepository.create(
      data,
    );
    return this.CommunityAppearanceSettingRepository.save(
      CommunityAppearanceSettingCreated,
    );
  }

  /**
   * Update CommunityAppearanceSetting
   */
  async updateCommunityAppearanceSetting(options: {}, data: {}): Promise<{}> {
    return this.CommunityAppearanceSettingRepository.update(options, data);
  }
}

import { Injectable } from '@nestjs/common';
import { StageNotificationSettingRepository } from './stageNotificationSetting.repository';
import { StageNotificationSettingEntity } from './stageNotificationSetting.entity';

@Injectable()
export class StageNotificationSettingService {
  constructor(
    public readonly stageNotificationSettingRepository: StageNotificationSettingRepository,
  ) {}

  /**
   * Get stageNotificationSettings
   */
  async getStageNotificationSettings(options: {}): Promise<
    StageNotificationSettingEntity[]
  > {
    return this.stageNotificationSettingRepository.find(options);
  }

  /**
   * Get stageNotificationSettings
   */
  async getStageNotificationSetting(options: {}): Promise<
    StageNotificationSettingEntity
  > {
    return this.stageNotificationSettingRepository.findOne(options);
  }

  /**
   * Add stageNotificationSetting
   */
  async addStageNotificationSetting(data: {}): Promise<
    StageNotificationSettingEntity
  > {
    const stageNotificationSettingCreated = this.stageNotificationSettingRepository.create(
      data,
    );
    return this.stageNotificationSettingRepository.save(
      stageNotificationSettingCreated,
    );
  }

  /**
   * Update stageNotificationSetting
   */
  async updateStageNotificationSetting(options: {}, data: {}): Promise<{}> {
    return this.stageNotificationSettingRepository.update(options, data);
  }

  /**
   * Add or Update Notification Setting
   */
  async addOrUpdateStageNotificationSetting(
    options: {},
    data: {},
  ): Promise<{}> {
    const settings = await this.getStageNotificationSetting({
      where: options,
    });

    let result;
    if (!settings) {
      result = this.addStageNotificationSetting(data);
    } else {
      result = this.updateStageNotificationSetting({ id: settings.id }, data);
    }
    return result;
  }

  /**
   * Delete stageNotificationSetting
   */
  async deleteStageNotificationSetting(options: {}): Promise<{}> {
    return this.stageNotificationSettingRepository.delete(options);
  }
}

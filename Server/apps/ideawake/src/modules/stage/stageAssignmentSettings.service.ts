import { Injectable } from '@nestjs/common';
import { StageAssignmentSettingsRepository } from './stageAssignmentSettings.repository';
import { StageAssignmentSettingsEntity } from './stageAssignmentSettings.entity';

@Injectable()
export class StageAssignmentSettingService {
  constructor(
    public readonly stageAssignmentSettingRepository: StageAssignmentSettingsRepository,
  ) {}

  /**
   * Get stageAssignmentSettings
   */
  async getStageAssignmentSettings(options: {}): Promise<
    StageAssignmentSettingsEntity[]
  > {
    return this.stageAssignmentSettingRepository.find(options);
  }

  /**
   * Get Single stageAssignmentSetting
   */
  async getStageAssignmentSetting(options: {}): Promise<
    StageAssignmentSettingsEntity
  > {
    return this.stageAssignmentSettingRepository.findOne(options);
  }

  /**
   * Add stageAssignmentSetting
   */
  async addStageAssignmentSetting(data: {}): Promise<
    StageAssignmentSettingsEntity
  > {
    const stageAssignmentSettingCreated = this.stageAssignmentSettingRepository.create(
      data,
    );
    return this.stageAssignmentSettingRepository.save(
      stageAssignmentSettingCreated,
    );
  }

  /**
   * Update stageAssignmentSetting
   */
  async updateStageAssignmentSetting(options: {}, data: {}): Promise<{}> {
    return this.stageAssignmentSettingRepository.update(options, data);
  }

  /**
   * Add or Update stageAssignmentSetting
   */
  async addOrUpdateStageAssignmentSetting(options: {}, data: {}): Promise<{}> {
    const settings = await this.getStageAssignmentSetting({
      where: options,
    });

    let result;
    if (!settings) {
      result = this.addStageAssignmentSetting(data);
    } else {
      result = this.updateStageAssignmentSetting({ id: settings.id }, data);
    }
    return result;
  }

  /**
   * Delete stageAssignmentSetting
   */
  async deleteStageAssignmentSetting(options: {}): Promise<{}> {
    return this.stageAssignmentSettingRepository.delete(options);
  }
}

import { Injectable } from '@nestjs/common';
import { StageAssigneeSettingsRepository } from './stageAssigneeSettings.repository';
import { StageAssigneeSettingsEntity } from './stageAssigneeSettings.entity';

@Injectable()
export class StageAssigneeService {
  constructor(
    public readonly stageAssigneeRepository: StageAssigneeSettingsRepository,
  ) {}

  /**
   * Get StageAssignees Settings
   */
  async getStageAssigneeSettings(options: {}): Promise<
    StageAssigneeSettingsEntity[]
  > {
    return this.stageAssigneeRepository.find(options);
  }

  /**
   * Get Single StageAssignees Setting
   */
  async getStageAssigneeSetting(options: {}): Promise<
    StageAssigneeSettingsEntity
  > {
    return this.stageAssigneeRepository.findOne(options);
  }

  /**
   * Add stageAssignee
   */
  async addstageAssignee(data: {}): Promise<StageAssigneeSettingsEntity> {
    const stageAssigneeCreated = this.stageAssigneeRepository.create(data);
    return this.stageAssigneeRepository.save(stageAssigneeCreated);
  }

  /**
   * Update stageAssignee
   */
  async updatestageAssignee(options: {}, data: {}): Promise<{}> {
    return this.stageAssigneeRepository.update(options, data);
  }

  /**
   * Add or Update Assignee Setting
   */
  async addOrUpdateStageAssigneeSetting(options: {}, data: {}): Promise<{}> {
    const settings = await this.getStageAssigneeSetting({
      where: options,
    });

    let result;
    if (!settings) {
      result = this.addstageAssignee(data);
    } else {
      result = this.updatestageAssignee({ id: settings.id }, data);
    }
    return result;
  }

  /**
   * Delete stageAssignee
   */
  async deletestageAssignee(options: {}): Promise<{}> {
    return this.stageAssigneeRepository.delete(options);
  }
}

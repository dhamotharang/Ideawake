import { Injectable } from '@nestjs/common';
import { EntityVisibilitySettingRepository } from './entityVisibilitySetting.repository';
import { EntityVisibilitySettingEntity } from './entityVisibilitySetting.entity';

@Injectable()
export class EntityVisibilitySettingService {
  constructor(
    public readonly entityVisibilitySettingRepository: EntityVisibilitySettingRepository,
  ) {}

  /**
   * Get entityVisibilitySettings
   */
  async getEntityVisibilitySetting(options: {}): Promise<
    EntityVisibilitySettingEntity
  > {
    return this.entityVisibilitySettingRepository.findOne(options);
  }
  /**
   * Get entityVisibilitySettings
   */
  async getEntityVisibilitySettings(options: {}): Promise<
    EntityVisibilitySettingEntity[]
  > {
    return this.entityVisibilitySettingRepository.find(options);
  }

  /**
   * Add entityVisibilitySetting
   */
  async addEntityVisibilitySetting(data: {}): Promise<
    EntityVisibilitySettingEntity
  > {
    const entityVisibilitySettingCreated = this.entityVisibilitySettingRepository.create(
      data,
    );
    return this.entityVisibilitySettingRepository.save(
      entityVisibilitySettingCreated,
    );
  }

  /**
   * Update entityVisibilitySetting
   */
  async updateEntityVisibilitySetting(options: {}, data: {}): Promise<{}> {
    return this.entityVisibilitySettingRepository.update(options, data);
  }

  /**
   * Delete entityVisibilitySetting
   */
  async deleteEntityVisibilitySetting(options: {}): Promise<{}> {
    return this.entityVisibilitySettingRepository.delete(options);
  }
}

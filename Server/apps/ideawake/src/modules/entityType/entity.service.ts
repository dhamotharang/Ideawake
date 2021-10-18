import { Injectable } from '@nestjs/common';
import { EntityTypeRepository } from './entity.repository';
import { EntityTypeEntity } from './entity.entity';

@Injectable()
export class EntityTypeService {
  constructor(public readonly entityTypeRepository: EntityTypeRepository) {}

  /**
   * Get EntityTypes
   */
  async getOneEntityType(options: {}): Promise<EntityTypeEntity> {
    return this.entityTypeRepository.findOne(options);
  }

  /**
   * Get EntityTypes
   */
  async getEntityTypes(options: {}): Promise<EntityTypeEntity[]> {
    return this.entityTypeRepository.find(options);
  }

  /**
   * Add EntityType
   */
  async addEntityType(data: {}): Promise<EntityTypeEntity> {
    const EntityTypeCreated = this.entityTypeRepository.create(data);
    return this.entityTypeRepository.save(EntityTypeCreated);
  }

  /**
   * Update EntityType
   */
  async updateEntityType(options: {}, data: {}): Promise<{}> {
    return this.entityTypeRepository.update(options, data);
  }

  /**
   * Delete EntityType
   */
  async deleteEntityType(options: {}): Promise<{}> {
    return this.entityTypeRepository.delete(options);
  }
}

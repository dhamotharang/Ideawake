import { Injectable } from '@nestjs/common';
import { TagReferenceMappingRepository } from './tagReferenceMapping.repository';
import { TagReferenceMappingEntity } from './tagReferenceMapping.entity';

@Injectable()
export class TagReferenceMappingService {
  constructor(
    public readonly tagReferenceMappingRepository: TagReferenceMappingRepository,
  ) {}

  /**
   * Get tagReferenceMappings
   */
  async getTagReferenceMappings(options: {}): Promise<
    TagReferenceMappingEntity[]
  > {
    return this.tagReferenceMappingRepository.find(options);
  }

  /**
   * Add tagReferenceMapping
   */
  async addTagReferenceMapping(data: {}): Promise<TagReferenceMappingEntity> {
    const tagReferenceMappingCreated = this.tagReferenceMappingRepository.create(
      data,
    );
    return this.tagReferenceMappingRepository.save(tagReferenceMappingCreated);
  }

  /**
   * Update tagReferenceMapping
   */
  async updateTagReferenceMapping(options: {}, data: {}): Promise<{}> {
    return this.tagReferenceMappingRepository.update(options, data);
  }

  /**
   * Delete tagReferenceMapping
   */
  async deleteTagReferenceMapping(options: {}): Promise<{}> {
    return this.tagReferenceMappingRepository.delete(options);
  }
}

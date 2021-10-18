import { Injectable } from '@nestjs/common';
import { TagRepository } from './tag.repository';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagService {
  constructor(public readonly tagRepository: TagRepository) {}

  /**
   * Get Tags
   */
  async getTags(options: {}): Promise<TagEntity[]> {
    return this.tagRepository.find(options);
  }

  /**
   * Add Tag
   */
  async addTag(data: {}): Promise<TagEntity> {
    const TagCreated = this.tagRepository.create(data);
    return this.tagRepository.save(TagCreated);
  }

  /**
   * Update Tag
   */
  async updateTag(options: {}, data: {}): Promise<{}> {
    return this.tagRepository.update(options, data);
  }

  /**
   * Delete Tag
   */
  async deleteTag(options: {}): Promise<{}> {
    return this.tagRepository.delete(options);
  }
}

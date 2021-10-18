import { Injectable } from '@nestjs/common';
import { ActionItemRepository } from './actionItem.repository';
import { ActionItemEntity } from './actionItem.entity';

@Injectable()
export class ActionItemService {
  constructor(public readonly actionItemRepository: ActionItemRepository) {}

  /**
   * Get actionItems
   */
  async getActionItems(options: {}): Promise<ActionItemEntity[]> {
    return this.actionItemRepository.find(options);
  }

  /**
   * Add actionItem
   */
  async addActionItem(data: {}): Promise<ActionItemEntity> {
    const actionItemCreated = this.actionItemRepository.create(data);
    return this.actionItemRepository.save(actionItemCreated);
  }

  /**
   * Update actionItem
   */
  async updateActionItem(options: {}, data: {}): Promise<{}> {
    return this.actionItemRepository.update(options, data);
  }
}

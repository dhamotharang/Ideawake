import { Injectable } from '@nestjs/common';
import { ShortcutRepository } from './shortcut.repository';
import { ShortcutEntity } from './shortcut.entity';

@Injectable()
export class ShortcutService {
  constructor(public readonly shortcutRepository: ShortcutRepository) {}

  /**
   * Get Shortcuts
   */
  async getShortcuts(options: {}): Promise<ShortcutEntity[]> {
    return this.shortcutRepository.find(options);
  }

  /**
   * Add Shortcut
   */
  async addShortcut(data: {}): Promise<ShortcutEntity> {
    const ShortcutCreated = this.shortcutRepository.create(data);
    return this.shortcutRepository.save(ShortcutCreated);
  }

  /**
   * Update Shortcut
   */
  async updateShortcut(options: {}, data: {}): Promise<{}> {
    return this.shortcutRepository.update(options, data);
  }

  /**
   * Delete Shortcut
   */
  async deleteShortcut(options: {}): Promise<{}> {
    return this.shortcutRepository.delete(options);
  }
}

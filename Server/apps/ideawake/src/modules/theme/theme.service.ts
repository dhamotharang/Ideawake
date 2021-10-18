import { Injectable } from '@nestjs/common';
import { ThemeRepository } from './theme.repository';
import { ThemeEntity } from './theme.entity';

@Injectable()
export class ThemeService {
  constructor(public readonly themeRepository: ThemeRepository) {}

  /**
   * Get themes
   */
  async getThemes(options: {}): Promise<ThemeEntity[]> {
    return this.themeRepository.find(options);
  }

  /**
   * Add theme
   */
  async addTheme(data: {}): Promise<ThemeEntity> {
    const themeCreated = this.themeRepository.create(data);
    return this.themeRepository.save(themeCreated);
  }

  /**
   * Update theme
   */
  async updateTheme(options: {}, data: {}): Promise<{}> {
    return this.themeRepository.update(options, data);
  }

  /**
   * Delete theme
   */
  async deleteTheme(options: {}): Promise<{}> {
    return this.themeRepository.delete(options);
  }
}

import { Injectable } from '@nestjs/common';
import { LanguageRepository } from './language.repository';
import { LanguageEntity } from './language.entity';

@Injectable()
export class LanguageService {
  constructor(public readonly languageRepository: LanguageRepository) {}

  /**
   * Get languages
   */
  async getLanguages(options: {}): Promise<LanguageEntity[]> {
    return this.languageRepository.find(options);
  }

  /**
   * Add language
   */
  async addLanguage(data: {}): Promise<LanguageEntity> {
    const languageCreated = this.languageRepository.create(data);
    return this.languageRepository.save(languageCreated);
  }

  /**
   * Update language
   */
  async updateLanguage(options: {}, data: {}): Promise<{}> {
    return this.languageRepository.update(options, data);
  }

  /**
   * Delete language
   */
  async deleteLanguage(options: {}): Promise<{}> {
    return this.languageRepository.delete(options);
  }
}

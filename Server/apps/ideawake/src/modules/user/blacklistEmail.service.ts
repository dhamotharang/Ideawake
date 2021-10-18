import { Injectable } from '@nestjs/common';
import { BlacklistEmailRepository } from './blacklistEmail.repository';
import { BlacklistEmailEntity } from './blacklistEmail.entity';

@Injectable()
export class BlacklistEmailService {
  constructor(
    public readonly blacklistEmailRepository: BlacklistEmailRepository,
  ) {}

  /**
   * Get blacklisted emails
   */
  async getBlacklistEmails(options: {}): Promise<BlacklistEmailEntity[]> {
    return this.blacklistEmailRepository.find(options);
  }

  /**
   * Get single blacklisted email
   */
  async getBlacklistEmail(options: {}): Promise<BlacklistEmailEntity> {
    return this.blacklistEmailRepository.findOne(options);
  }

  /**
   * Add blacklistEmail
   */
  async addBlacklistEmail(data: {}): Promise<BlacklistEmailEntity> {
    const blacklistEmailCreated = this.blacklistEmailRepository.create(data);
    return this.blacklistEmailRepository.save(blacklistEmailCreated);
  }

  /**
   * Update blacklistEmail
   */
  async updateBlacklistEmail(options: {}, data: {}): Promise<{}> {
    return this.blacklistEmailRepository.update(options, data);
  }

  /**
   * Delete blacklistEmail
   */
  async deleteBlacklistEmail(options: {}): Promise<{}> {
    return this.blacklistEmailRepository.delete(options);
  }
}

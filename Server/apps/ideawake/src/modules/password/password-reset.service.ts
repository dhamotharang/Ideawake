import { Injectable } from '@nestjs/common';
import { PasswordResetRepository } from './password-reset.repository';
import { PasswordResetEntity } from './password-reset.entity';

@Injectable()
export class PasswordResetService {
  constructor(
    public readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  /**
   * Get password-reset
   */
  async getPasswordResets(options: {}): Promise<PasswordResetEntity[]> {
    return this.passwordResetRepository.find(options);
  }

  /**
   * Get password reset
   */
  async getPasswordReset(options: {}): Promise<PasswordResetEntity> {
    return this.passwordResetRepository.findOne(options);
  }

  /**
   * Add password-reset
   */
  async addPasswordReset(data: {}): Promise<PasswordResetEntity> {
    const passResetCreated = this.passwordResetRepository.create(data);
    return this.passwordResetRepository.save(passResetCreated);
  }

  /**
   * Update password-reset
   */
  async updatePasswordReset(options: {}, data: {}): Promise<{}> {
    return this.passwordResetRepository.update(options, data);
  }

  /**
   * Delete password-reset
   */
  async deletePasswordReset(options: {}): Promise<{}> {
    return this.passwordResetRepository.delete(options);
  }
}

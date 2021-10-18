import { Injectable } from '@nestjs/common';
import { PasswordPolicyRepository } from './password-policy.repository';
import { PasswordPolicyEntity } from './password-policy.entity';
@Injectable()
export class PasswordPolicyService {
  constructor(
    public readonly passwordPolicyRepository: PasswordPolicyRepository,
  ) {}

  /**
   * Get password-policy
   */
  async getPasswordPolicies(options: {}): Promise<PasswordPolicyEntity[]> {
    return this.passwordPolicyRepository.find(options);
  }

  /**
   * Add password-policy
   */
  async addPasswordPolicy(data: {}): Promise<PasswordPolicyEntity> {
    const passPolicyCreated = this.passwordPolicyRepository.create(data);
    return this.passwordPolicyRepository.save(passPolicyCreated);
  }

  /**
   * Update password-policy
   */
  async updatePasswordPolicy(options: {}, data: {}): Promise<{}> {
    return this.passwordPolicyRepository.update(options, data);
  }

  /**
   * Delete password-policy
   */
  async deletePasswordPolicy(options: {}): Promise<{}> {
    return this.passwordPolicyRepository.delete(options);
  }
}

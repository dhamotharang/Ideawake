import { Injectable } from '@nestjs/common';
import { EmailTemplateRepository } from './email-template.repository';
import { EmailTemplateEntity } from './email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    public readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  /**
   * Get email-templates
   */
  async getEmailTemplates(options: {}): Promise<EmailTemplateEntity[]> {
    return this.emailTemplateRepository.find(options);
  }

  /**
   * Add email-template
   */
  async addEmailTemplate(data: {}): Promise<EmailTemplateEntity> {
    const templateCreated = this.emailTemplateRepository.create(data);
    return this.emailTemplateRepository.save(templateCreated);
  }

  /**
   * Update email-template
   */
  async updateEmailTemplate(options: {}, data: {}): Promise<{}> {
    return this.emailTemplateRepository.update(options, data);
  }

  /**
   * Delete email-template
   */
  async deleteEmailTemplate(options: {}): Promise<{}> {
    return this.emailTemplateRepository.delete(options);
  }
}

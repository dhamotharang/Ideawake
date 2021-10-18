import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';

@Injectable()
export class EmailTemplateService {
  private client: ClientProxy;
  constructor(private readonly microServiceClient: MicroServiceClient) {
    this.client = this.microServiceClient.client();
  }
  /**
   * Get cmmunity email templates from notification service
   * @param {Object} params userId and community
   * @returns List of email templates against community
   */
  public getCommunityEmailTemplates(params: {}): Promise<[]> {
    return this.client.send('getEmailTemplateForCommunity', params).toPromise();
  }
  /**
   * Update community email templates
   * @param {Object} params {
   * filters: userId, communityId, templateId
   * data: body
   * }
   * @return Updated list of email temaplate
   */
  public updateCommunityEmailTemplate(params: {}): Promise<{}> {
    return this.client.send('updateCommunityEmailTemplate', params).toPromise();
  }
}

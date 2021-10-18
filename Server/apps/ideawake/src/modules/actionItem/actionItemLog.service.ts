import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
@Injectable()
export class ActionItemLogService {
  private client: ClientProxy;
  constructor(private readonly microServiceClient: MicroServiceClient) {
    this.client = this.microServiceClient.client();
  }

  public searchActionItemLogs(data: {}): Promise<{}> {
    return this.client.send('searchActionItemLogs', data).toPromise();
  }

  public getActionItemLogsStatusCounts(data: {
    community: number;
    userId: number;
    actionItemId?: number;
    actionItemAbbreviation?: string;
    isNotification?: boolean;
  }): Promise<{
    open: number;
    complete: number;
    incomplete: number;
  }> {
    return this.client.send('getActionItemLogsStatusCounts', data).toPromise();
  }

  public updateReadStatus(data: {}): Promise<[]> {
    return this.client.send('updateActionItemLogReadStatus', data).toPromise();
  }
}

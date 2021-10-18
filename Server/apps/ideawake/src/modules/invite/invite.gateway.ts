import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { InviteService } from './invite.service';
import { ConfigService } from '../../shared/services/config.service';
const configService = new ConfigService();

@WebSocketGateway(configService.getNumber('SOCKET_PORT'), {
  namespace: '/invite',
  transports: ['websocket'],
})
export class InviteGateway {
  constructor(private readonly inviteService: InviteService) {}
  @WebSocketServer() wss: Server;

  async pushInvites(communityId: number): Promise<void> {
    const inviteData = await this.inviteService.getInvitesByCommunity(
      communityId,
    );
    this.wss.emit(communityId.toString(), inviteData.invites);
  }

  @SubscribeMessage('requestInvites')
  async requestInvites(@MessageBody()
  data: {
    communityId: number;
  }): Promise<{}> {
    const inviteData = await this.inviteService.getInvitesByCommunity(
      data.communityId,
    );
    return inviteData.invites;
  }
}

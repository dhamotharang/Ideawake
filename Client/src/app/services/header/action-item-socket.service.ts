import { Socket } from 'ngx-socket-io';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class ActionItemSocketService extends Socket {
  constructor() {
    super({
      url: environment.socket.actionItemNotificationSocket,
      options: { transports: ['websocket'] }
    });
  }
}

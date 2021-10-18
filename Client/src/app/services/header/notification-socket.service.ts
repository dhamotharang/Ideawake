import { Socket } from 'ngx-socket-io';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class NotificationSocketService extends Socket {
  constructor() {
    super({
      url: environment.socket.activityLogSocket,
      options: { transports: ['websocket'] }
    });
  }
}

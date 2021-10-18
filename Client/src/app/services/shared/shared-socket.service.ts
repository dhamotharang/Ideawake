import { Socket } from 'ngx-socket-io';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SocketService extends Socket {
  constructor() {
    super({ url: '', options: {} });
  }
}

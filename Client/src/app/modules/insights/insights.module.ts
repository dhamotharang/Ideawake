import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { environment } from '../../../environments/environment';
import { SharedModule } from '../shared/shared.module';
import {
  InsightAddComponent,
  InsightPageContainerComponent,
  InsightsListContainerComponent
} from './components';
import { InsightsRoutingModule } from './insights-routing.module';

const config: SocketIoConfig = {
  url: environment.socket.insightsSocket,
  options: { transports: ['websocket'] }
};

// @dynamic
@NgModule({
  declarations: [
    InsightsListContainerComponent,
    InsightPageContainerComponent,
    InsightAddComponent
  ],
  imports: [
    CommonModule,
    InsightsRoutingModule,
    SharedModule,
    SocketIoModule.forRoot(config)
  ]
})
export class InsightsModule {}

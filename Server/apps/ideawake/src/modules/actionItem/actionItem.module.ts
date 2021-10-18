import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionItemRepository } from './actionItem.repository';
import { ActionItemController } from './actionItem.controller';
import { ActionItemService } from './actionItem.service';
import { ActionItemLogService } from './actionItemLog.service';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';

@Module({
  imports: [TypeOrmModule.forFeature([ActionItemRepository])],
  controllers: [ActionItemController],
  exports: [ActionItemService, ActionItemLogService],
  providers: [ActionItemService, ActionItemLogService, MicroServiceClient],
})
export class ActionItemModule {}

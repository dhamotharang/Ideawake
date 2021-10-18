import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardRepository } from './dashboard.repository';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WidgetRepository } from './widget.repository';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardRepository]),
    TypeOrmModule.forFeature([WidgetRepository]),
  ],
  controllers: [DashboardController, WidgetController],
  exports: [DashboardService, WidgetService],
  providers: [DashboardService, WidgetService],
})
export class DashboardModule {}

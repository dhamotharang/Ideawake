import {
  ActivitySummaryComponent,
  AggregatedTileChartComponent,
  BarChartComponent,
  BubbleChartComponent,
  EngagementAnalyticsComponent,
  GeolocationDatatableComponent,
  GeolocationMapComponent,
  PieChartComponent,
  PivotChartComponent,
  ScatterChartComponent,
  TimeSeriesChartComponent,
  TopEngagedGroupComponent,
  TopEngagedUserComponent,
  WidgetManageComponent
} from './components';
import { AnalyticsApiService, ChallengesApiService } from '../../services';

import { ChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { I18nModule } from '../i18n/i18n.module';
import { IdeaModule } from '../idea/idea.module';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ActivitySummaryComponent,
    EngagementAnalyticsComponent,
    GeolocationDatatableComponent,
    GeolocationMapComponent,
    TopEngagedGroupComponent,
    TopEngagedUserComponent,
    WidgetManageComponent,
    PieChartComponent,
    BubbleChartComponent,
    TimeSeriesChartComponent,
    BarChartComponent,
    PivotChartComponent,
    ScatterChartComponent,
    AggregatedTileChartComponent
  ],
  imports: [
    CommonModule,
    ChartsModule,
    FontAwesomeModule,
    I18nModule,
    NgbModule,
    IdeaModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    ActivitySummaryComponent,
    EngagementAnalyticsComponent,
    GeolocationDatatableComponent,
    GeolocationMapComponent,
    TopEngagedGroupComponent,
    TopEngagedUserComponent,
    WidgetManageComponent,
    PieChartComponent,
    BubbleChartComponent,
    TimeSeriesChartComponent,
    BarChartComponent,
    PivotChartComponent,
    ScatterChartComponent,
    AggregatedTileChartComponent
  ],
  providers: [ChallengesApiService, AnalyticsApiService]
})
export class AnalyticsModule {}

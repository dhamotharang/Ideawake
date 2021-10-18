import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  GetChallengeActorEngagementParams,
  GetChallengeActorEngagementQuery,
  GetCommunityActorEngagementParams,
  GetChallengeActivitySummaryParams,
  GetChallengeActivitySummaryQuery,
  GetCommunityGroupsTopEngagementParams,
  GetCommunityUsersTopEngagementParams,
  GetChallengeGroupsTopEngagementParams,
  GetChallengeGroupsTopEngagementQuery,
  GetChallengeUsersTopEngagementParams,
  GetChallengeUsersTopEngagementQuery,
  GetChallengeRegionsTopEngagementParams,
  GetChallengeRegionsTopEngagementQuery,
  GetCommunityRegionsTopEngagementParams,
} from './dto/AnalyticsDto';
import { SharedService } from '../../shared/services/shared.services';
import { Request } from 'express';
import { MoreThanOrEqual, IsNull, In } from 'typeorm';
import * as _ from 'lodash';
import { OpportunityTypeService } from '../opportunityType/opportunityType.service';
import { CircleService } from '../circle/circle.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { UtilsService } from '../../providers/utils.service';
import { StageHistoryService } from '../stage/stageHistory.service';
import { StageService } from '../stage/stage.service';
import { StatusService } from '../status/status.service';
import * as moment from 'moment';
import { CustomFieldDataService } from '../customField/customFieldData.service';
import { OpportunityUserService } from '../opportunityUser/opportunityUser.service';
import { OpportunityUserType } from '../../enum/opportunity-user-type.enum';
import { GetBubbleChartDataDto } from './dto';
import { BubbleColorTypeEnum, BubbleDataPointTypeEnum } from './enum';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { ENTITY_TYPES } from '../../common/constants/constants';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly sharedService: SharedService,
    private readonly opportunityTypeService: OpportunityTypeService,
    private readonly circleService: CircleService,
    private readonly opportunityService: OpportunityService,
    private readonly stageHistoryService: StageHistoryService,
    private readonly stageService: StageService,
    private readonly statusService: StatusService,
    private readonly customFieldDataService: CustomFieldDataService,
    private readonly opportunityUserService: OpportunityUserService,
  ) {}

  @Get('challenge/:challenge/actor-engagement')
  async getChallengeActorEngagement(
    @Param() params: GetChallengeActorEngagementParams,
    @Query() queryParams: GetChallengeActorEngagementQuery,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getActorEngagement({
      challenge: params.challenge,
      community: queryParams.community,
    });
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('challenge/:challenge/activity-summary')
  async getChallengeActivitySummary(
    @Param() params: GetChallengeActivitySummaryParams,
    @Query() queryParams: GetChallengeActivitySummaryQuery,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getActivitySummary({
      challenge: params.challenge,
      community: queryParams.community,
    });
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('community/:community/activity-summary')
  async getCommunitySummary(
    @Param() _params: GetCommunityActorEngagementParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getActivitySummary({
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('community/:community/groups/top-engagement')
  async getCommunityGroupsTopEngagement(
    @Param() _params: GetCommunityGroupsTopEngagementParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityGroupsTopEngagement(
      { community: req['userData'].currentCommunity },
    );
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('challenge/:challenge/groups/top-engagement')
  async getChallengeGroupsTopEngagement(
    @Param() params: GetChallengeGroupsTopEngagementParams,
    @Query() queryParams: GetChallengeGroupsTopEngagementQuery,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityGroupsTopEngagement(
      {
        challenge: params.challenge,
        community: queryParams.community,
      },
    );
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('community/:community/users/top-engagement')
  async getCommunityUsersTopEngagement(
    @Param() _params: GetCommunityUsersTopEngagementParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityUsersTopEngagement(
      { community: req['userData'].currentCommunity },
    );
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('challenge/:challenge/users/top-engagement')
  async getChallengeUsersTopEngagement(
    @Param() params: GetChallengeUsersTopEngagementParams,
    @Query() queryParams: GetChallengeUsersTopEngagementQuery,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityUsersTopEngagement(
      {
        challenge: params.challenge,
        community: queryParams.community,
      },
    );
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('community/:community/top-engagement-location')
  async getCommunityTopEngagedLocations(
    @Param() _params: GetCommunityRegionsTopEngagementParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityTopEngagedLocations(
      { community: req['userData'].currentCommunity },
    );
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('challenge/:challenge/top-engagement-location')
  async getChallengeTopEngagedLocations(
    @Param() params: GetChallengeRegionsTopEngagementParams,
    @Query() queryParams: GetChallengeRegionsTopEngagementQuery,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityTopEngagedLocations(
      {
        challenge: params.challenge,
        community: queryParams.community,
      },
    );
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Get('community/:community/counts')
  async getCommunityCounts(
    @Param() _params: GetCommunityRegionsTopEngagementParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const analytics = await this.analyticsService.getCommunityCounts({
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(analytics, 'All');
  }

  @Post('dashboard/opportunities/pie')
  async getDashboardOpportunitiesForPie(
    @Body() body,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    body.opportunityFilter = {
      ...body.opportunityFilter,
      community: req['userData'].currentCommunity,
    };
    const responseData = await this.sharedService.getAllOpportunities(
      body.opportunityFilter,
      req,
      ['opportunityUsers'],
    );

    let graphData = [];
    if (responseData.count) {
      if (body.graphDataPoint && body.graphDataPoint === 'opportunityType') {
        const allTypes = await this.opportunityTypeService.getOpportunityTypes({
          community: req['userData'].currentCommunity,
          isDeleted: false,
        });
        const groupedTypes = _.groupBy(allTypes, 'id');
        const tempData = _.groupBy(responseData.data, 'opportunityTypeId');

        _.map(tempData, (val, key) => {
          if (groupedTypes[key]) {
            graphData.push({
              title: _.head(groupedTypes[key]).name,
              count: val.length,
            });
          }
        });
      } else if (body.graphDataPoint && body.graphDataPoint === 'submitter') {
        const submitters = await this.opportunityUserService.getOpportunityUsers(
          {
            where: {
              opportunity: In(_.map(responseData.data, 'id')),
              opportunityUserType: OpportunityUserType.SUBMITTER,
              community: req['userData'].currentCommunity,
            },
          },
        );
        const submittersGrouped = _.groupBy(submitters, 'userId');
        graphData = await this.analyticsService.getUsersCountsFromGroupedData(
          submittersGrouped,
          req['userData'].currentCommunity,
        );
      } else if (body.graphDataPoint && body.graphDataPoint === 'owner') {
        const owners = await this.opportunityUserService.getOpportunityUsers({
          where: {
            opportunity: In(_.map(responseData.data, 'id')),
            opportunityUserType: OpportunityUserType.OWNER,
            community: req['userData'].currentCommunity,
          },
        });
        const ownersGrouped = _.groupBy(owners, 'userId');
        graphData = await this.analyticsService.getUsersCountsFromGroupedData(
          ownersGrouped,
          req['userData'].currentCommunity,
        );
      } else if (
        body.graphDataPoint &&
        body.graphDataPoint === 'customField' &&
        body.customField
      ) {
        // Get custom field data counts out of the filtered opportunities.
        const dataCounts = _.head(
          await this.customFieldDataService.getFieldsDataCounts({
            community: req['userData'].currentCommunity,
            fields: [body.customField],
            opportunities: responseData.data,
            opportunitiesCount: responseData.count,
            returnFieldDetail: true,
          }),
        );
        if (dataCounts) {
          if (dataCounts.responses && dataCounts.responses.length) {
            const fieldOptions = dataCounts.fieldDetail.fieldDataObject['data'];
            const optionsGrouped = _.groupBy(fieldOptions, 'value');

            graphData = dataCounts.responses.map(resp => ({
              title: _.get(
                _.head(optionsGrouped[resp.option]),
                'label',
                'Unspecified',
              ),
              count: resp.count,
            }));
          } else {
            graphData = [
              { title: 'Has entry', count: dataCounts.hasEntry },
              { title: `Doesn't have entry`, count: dataCounts.noEntry },
            ];
          }
        }
      } else if (
        body.graphDataPoint &&
        body.graphDataPoint === 'currentlyAssigned'
      ) {
        const assignees = _.flatten(
          await Promise.all(
            responseData.data.map(opportunity =>
              this.opportunityService.getCurrentStageAssignees(opportunity.id),
            ),
          ),
        );
        const assigneesGrouped = _.groupBy(assignees, 'id');
        graphData = await this.analyticsService.getUsersCountsFromGroupedData(
          assigneesGrouped,
          req['userData'].currentCommunity,
        );
      }
    }

    return ResponseFormatService.responseOk(graphData, 'Pie Chart Data.');
  }

  @Post('dashboard/opportunities/bubble')
  async getBubbleChartData(
    @Body() body: GetBubbleChartDataDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // The following implementation is based on the documentation given here:
    // https://docs.google.com/document/d/18qhs1ZdMNqfpwsMGa6LKL_gwKCqGShUq0b2_mvgbSXg/edit

    body.opportunityFilter = {
      ...body.opportunityFilter,
      community: req['userData'].currentCommunity,
    };
    const responseData = await this.sharedService.getAllOpportunities(
      body.opportunityFilter,
      req,
    );

    const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const graphData = {
      data: [],
    };
    if (responseData.count) {
      let oppoColorGrouped: _.Dictionary<{}[]> = {};
      let radiusDataGrouped = {};
      let xAxisDataGrouped = {};
      let yAxisDataGrouped = {};

      // Radius data calculation.
      if (body.radiusDataPoint.type === BubbleDataPointTypeEnum.VOTES) {
        radiusDataGrouped = await this.analyticsService.getGroupedVoteCounts(
          responseData.data,
          req['userData'].currentCommunity,
          oppoEntityType,
        );
      } else if (
        body.radiusDataPoint.type === BubbleDataPointTypeEnum.TOTAL_SCORE
      ) {
        radiusDataGrouped = await this.analyticsService.getGroupedTotalScores(
          responseData.data,
          req['userData'].currentCommunity,
        );
      } else if (
        body.radiusDataPoint.type === BubbleDataPointTypeEnum.STAGE_SCORE
      ) {
        radiusDataGrouped = await this.analyticsService.getGroupedStageScores(
          responseData.data,
          req['userData'].currentCommunity,
        );
      } else if (
        body.radiusDataPoint.type === BubbleDataPointTypeEnum.COMMENTS
      ) {
        radiusDataGrouped = await this.analyticsService.getGroupedCommentsCounts(
          responseData.data,
          req['userData'].currentCommunity,
          oppoEntityType,
        );
      } else if (body.radiusDataPoint.type === BubbleDataPointTypeEnum.VIEWS) {
        radiusDataGrouped = await this.analyticsService.getGroupedViewsCounts(
          responseData.data,
        );
      } else if (
        body.radiusDataPoint.type === BubbleDataPointTypeEnum.CUSTOM_FIELD &&
        body.radiusDataPoint.id
      ) {
        radiusDataGrouped = await this.analyticsService.getCustomFieldBubbleData(
          responseData.data,
          body.radiusDataPoint.id,
          req['userData'].currentCommunity,
        );
      } else if (
        body.radiusDataPoint.type === BubbleDataPointTypeEnum.CRITERIA &&
        body.radiusDataPoint.id
      ) {
        radiusDataGrouped = await this.analyticsService.getCriteriaBubbleData(
          responseData.data,
          body.radiusDataPoint.id,
          req['userData'].currentCommunity,
        );
      }

      // X axis data calculation.
      if (body.xAxisDataPoint.type === BubbleDataPointTypeEnum.TOTAL_SCORE) {
        xAxisDataGrouped = await this.analyticsService.getGroupedTotalScores(
          responseData.data,
          req['userData'].currentCommunity,
        );
      } else if (
        body.xAxisDataPoint.type === BubbleDataPointTypeEnum.STAGE_SCORE
      ) {
        xAxisDataGrouped = await this.analyticsService.getGroupedStageScores(
          responseData.data,
          req['userData'].currentCommunity,
        );
      } else if (
        body.xAxisDataPoint.type === BubbleDataPointTypeEnum.CUSTOM_FIELD &&
        body.xAxisDataPoint.id
      ) {
        xAxisDataGrouped = await this.analyticsService.getCustomFieldBubbleData(
          responseData.data,
          body.xAxisDataPoint.id,
          req['userData'].currentCommunity,
        );
      } else if (
        body.xAxisDataPoint.type === BubbleDataPointTypeEnum.CRITERIA &&
        body.xAxisDataPoint.id
      ) {
        xAxisDataGrouped = await this.analyticsService.getCriteriaBubbleData(
          responseData.data,
          body.xAxisDataPoint.id,
          req['userData'].currentCommunity,
        );
      }

      // Y axis data calculation.
      if (body.yAxisDataPoint.type === BubbleDataPointTypeEnum.TOTAL_SCORE) {
        yAxisDataGrouped = await this.analyticsService.getGroupedTotalScores(
          responseData.data,
          req['userData'].currentCommunity,
        );
      } else if (
        body.yAxisDataPoint.type === BubbleDataPointTypeEnum.STAGE_SCORE
      ) {
        yAxisDataGrouped = await this.analyticsService.getGroupedStageScores(
          responseData.data,
          req['userData'].currentCommunity,
        );
      } else if (
        body.yAxisDataPoint.type === BubbleDataPointTypeEnum.CUSTOM_FIELD &&
        body.yAxisDataPoint.id
      ) {
        yAxisDataGrouped = await this.analyticsService.getCustomFieldBubbleData(
          responseData.data,
          body.yAxisDataPoint.id,
          req['userData'].currentCommunity,
        );
      } else if (
        body.yAxisDataPoint.type === BubbleDataPointTypeEnum.CRITERIA &&
        body.yAxisDataPoint.id
      ) {
        yAxisDataGrouped = await this.analyticsService.getCriteriaBubbleData(
          responseData.data,
          body.yAxisDataPoint.id,
          req['userData'].currentCommunity,
        );
      }

      // Color data calculation.
      if (body.bubbleColor.type === BubbleColorTypeEnum.OPPORTUNITY_TYPE) {
        oppoColorGrouped = _.groupBy(responseData.data, 'opportunityTypeId');
        const oppoTypes = await this.opportunityTypeService.getOpportunityTypes(
          { where: { community: req['userData'].currentCommunity } },
        );
        graphData.data = this.analyticsService.mapGroupedDataToBubbleAxis(
          oppoTypes,
          oppoColorGrouped,
          radiusDataGrouped,
          xAxisDataGrouped,
          yAxisDataGrouped,
          'name',
          'color',
        );
      } else if (body.bubbleColor.type === BubbleColorTypeEnum.STATUS) {
        oppoColorGrouped = _.groupBy(responseData.data, 'stage.statusId');
        const statuses = await this.statusService.getStatuses({
          where: { community: req['userData'].currentCommunity },
        });
        graphData.data = this.analyticsService.mapGroupedDataToBubbleAxis(
          statuses,
          oppoColorGrouped,
          radiusDataGrouped,
          xAxisDataGrouped,
          yAxisDataGrouped,
          'title',
          'colorCode',
        );
      } else if (body.bubbleColor.type === BubbleColorTypeEnum.STAGE) {
        oppoColorGrouped = _.groupBy(responseData.data, 'stageId');
        const stages = await this.stageService.getStages({
          where: { community: req['userData'].currentCommunity },
        });
        graphData.data = this.analyticsService.mapGroupedDataToBubbleAxis(
          stages,
          oppoColorGrouped,
          radiusDataGrouped,
          xAxisDataGrouped,
          yAxisDataGrouped,
          'title',
        );
      }
    }

    return ResponseFormatService.responseOk(graphData, 'Bubble Chart Data.');
  }

  @Get('dashboard/circle/pie')
  async getDashboardGroups(@Req() req: Request): Promise<ResponseFormat> {
    const responseData = await this.circleService.getCircles({
      relations: ['circleUsers'],
      where: { community: req['userData'].currentCommunity },
    });
    const graphData = [];
    _.map(responseData, (val, _key) => {
      graphData.push({
        title: val.name,
        count: val.circleUsers.length,
      });
    });
    return ResponseFormatService.responseOk(graphData, 'All');
  }

  @Post('dashboard/opportunities/time-series')
  async getDashboardOpportunityTimeSeries(
    @Body() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Getting date ranges for the last 3 months by the given span type.
    let dateRangeBySpan = [];
    if (queryParams.spanType === 'daily') {
      dateRangeBySpan = UtilsService.getPastDatesByMonths(3);
    } else if (queryParams.spanType === 'weekly') {
      dateRangeBySpan = UtilsService.getWeekDates(3);
    } else if (queryParams.spanType === 'monthly') {
      dateRangeBySpan = UtilsService.getPastMonths(3);
    }

    const responseData = await this.sharedService.getAllOpportunities(
      {
        ...queryParams.opportunityFilter,
        community: req['userData'].currentCommunity,
      },
      req,
    );
    const graphData = {};
    if (responseData.count) {
      const opportunityIds = _.map(responseData.data, 'id');
      const oppoIdsString = opportunityIds.toString();

      if (
        _.get(queryParams, 'graphDataPoints.opportunityTypes.length', false)
      ) {
        graphData['opportunityTypes'] = {};
        const countData = await this.opportunityService.getDataForAnalyticsForTimeSeries(
          oppoIdsString,
          req['userData'].currentCommunity,
          queryParams.graphDataPoints.opportunityTypes.toString(),
          queryParams.spanType,
        );
        const allTypes = await this.opportunityTypeService.getOpportunityTypes({
          community: req['userData'].currentCommunity,
        });

        const groupedTypes = _.groupBy(allTypes, 'id');
        if (queryParams.spanType === 'daily') {
          graphData['opportunityTypes']['daily'] = [];
          _.map(countData.daily, (val, _key) => {
            graphData['opportunityTypes']['daily'].push({
              date: moment(val['date_trunc']).format('YYYY-MM-DD'),
              title: _.head(groupedTypes[val['opportunity_type_id']]).name,
              count: parseInt(val['count']),
            });
          });
        }
        if (queryParams.spanType === 'weekly') {
          graphData['opportunityTypes']['weekly'] = [];
          _.map(countData.weekly, (val, _key) => {
            graphData['opportunityTypes']['weekly'].push({
              date: moment(val['date_trunc']).format('YYYY-MM-DD'),
              title: _.head(groupedTypes[val['opportunity_type_id']]).name,
              count: parseInt(val['count']),
            });
          });
        }
        if (queryParams.spanType === 'monthly') {
          graphData['opportunityTypes']['monthly'] = [];
          _.map(countData.monthly, (val, _key) => {
            graphData['opportunityTypes']['monthly'].push({
              date: moment(val['date_trunc']).format('YYYY-MM-DD'),
              title: _.head(groupedTypes[val['opportunity_type_id']]).name,
              count: parseInt(val['count']),
            });
          });
        }
      }

      if (_.get(queryParams, 'graphDataPoints.stages.length', false)) {
        graphData['stages'] = { [queryParams.spanType]: [] };
        const stages = await this.stageService.getStages({
          where: [{ id: In(queryParams.graphDataPoints.stages) }],
        });
        const stagesById = _.keyBy(stages, 'id');
        const stageHistory = await this.stageHistoryService.getStageHistory({
          where: [
            { exitingAt: MoreThanOrEqual(moment().subtract(3, 'months')) },
            { exitingAt: IsNull() },
            { stage: In(queryParams.graphDataPoints.stages) },
            { opportunity: In(opportunityIds) },
          ],
        });
        const stageHistoryGroupBy = _.groupBy(stageHistory, 'stageId');
        // Data Traversing
        _.forEach(dateRangeBySpan, date => {
          _.forEach(queryParams.graphDataPoints.stages, stage => {
            const counts = _.filter(
              _.get(stageHistoryGroupBy, stage, []),
              function(obj) {
                if (
                  moment(obj.enteringAt).diff(moment(date), 'days') <= 0 &&
                  (obj.exitingAt === null ||
                    moment(obj.exitingAt).diff(moment(date), 'days') >= 0)
                ) {
                  return obj;
                }
              },
            ).length;
            if (counts > 0) {
              graphData['stages'][queryParams.spanType].push({
                date: date,
                title: _.get(stagesById[stage], 'title', ''),
                count: counts,
              });
            }
          });
        });
      }

      if (_.get(queryParams, 'graphDataPoints.status.length', false)) {
        graphData['status'] = { [queryParams.spanType]: [] };
        const status = await this.statusService.getStatuses({
          where: [{ id: In(queryParams.graphDataPoints.status) }],
        });
        const statusById = _.keyBy(status, 'id');
        const statusHistory = await this.stageHistoryService.getStageHistory({
          where: [
            { exitingAt: MoreThanOrEqual(moment().subtract(3, 'months')) },
            { exitingAt: IsNull() },
            { status: In(queryParams.graphDataPoints.status) },
            { opportunity: In(opportunityIds) },
          ],
        });
        const statusHistoryGroupBy = _.groupBy(statusHistory, 'statusId');
        // Data Traversing
        _.forEach(dateRangeBySpan, date => {
          _.forEach(queryParams.graphDataPoints.status, status => {
            const counts = _.filter(
              _.get(statusHistoryGroupBy, status, []),
              obj => {
                if (
                  moment(obj.enteringAt).diff(moment(date), 'days') <= 0 &&
                  (obj.exitingAt === null ||
                    moment(obj.exitingAt).diff(moment(date), 'days') >= 0)
                ) {
                  return obj;
                }
              },
            ).length;
            if (counts > 0) {
              graphData['status'][queryParams.spanType].push({
                date: date,
                title: _.get(statusById[status], 'title', ''),
                count: counts,
              });
            }
          });
        });
      }

      if (_.get(queryParams, 'graphDataPoints.stageChange')) {
        graphData['stageChange'] = {};
        let changeHistory = await this.stageHistoryService.getChangedTimeSeries(
          opportunityIds,
          _.first(dateRangeBySpan),
          queryParams.spanType,
        );
        changeHistory = _.map(changeHistory, val => {
          val['title'] = 'Stage Changed';
          val.date = moment(val.date).format('YYYY-MM-DD');
          return val;
        });
        graphData['stageChange'][queryParams.spanType] = changeHistory;
      }

      if (_.get(queryParams, 'graphDataPoints.statusChange')) {
        // Code here
      }
    }

    return ResponseFormatService.responseOk(
      { graphData, dateRange: dateRangeBySpan },
      'All',
    );
  }
}

import { Injectable } from '@nestjs/common';
import { OpportunityService } from '../opportunity/opportunity.service';
import { ChallengeService } from '../challenge/challenge.service';
import { VoteService } from '../vote/vote.service';
import { EntityTypeService } from '../entityType/entity.service';
import { In } from 'typeorm';
import {
  CUSTOM_FIELD_TYPE_ABBREVIATIONS,
  ENTITY_TYPES,
  EVALUATION_TYPE_ABBREVIATIONS,
  USER_ACTION_POINT_FUNCTION_OPTIONS,
} from '../../common/constants/constants';
import { CommentService } from '../comment/comment.service';
import { ShareService } from '../share/share.service';
import { UserActionPointService } from '../userActionPoint/userActionPoint.service';
import {
  sumBy,
  groupBy,
  map,
  head,
  Dictionary,
  get,
  forEach,
  chain,
  max,
} from 'lodash';
import { UtilsService } from '../../providers/utils.service';
import { UserService } from '../user/user.service';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { EvaluationCriteriaService } from '../evaluationCriteria/evaluationCriteria.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { CustomFieldService } from '../customField/customField.service';
import { CustomFieldDataService } from '../customField/customFieldData.service';
import { OpportunityEvaluationResponseService } from '../evaluationCriteria/opportunityEvaluationResponse.service';

@Injectable()
export class AnalyticsService {
  constructor(
    public opportunityService: OpportunityService,
    public challengeService: ChallengeService,
    public voteService: VoteService,
    public entityTypeService: EntityTypeService,
    public commentService: CommentService,
    public shareService: ShareService,
    public userActionPointService: UserActionPointService,
    public userService: UserService,
    public evaluationCriteriaService: EvaluationCriteriaService,
    public opportunityEvaluationResponseService: OpportunityEvaluationResponseService,
    public customFieldService: CustomFieldService,
    public customFieldDataService: CustomFieldDataService,
  ) {}

  /**
   * Get analyticss
   */
  async getActorEngagement(params: {
    challenge?: number;
    community: number;
  }): Promise<{}> {
    let where = {};
    where = { community: params.community };
    if (params.challenge) {
      where = { where, ...{ challenge: params.challenge } };
    }
    const opportunityData = await this.opportunityService.getOpportunities({
      where: where,
      select: ['id'],
    });
    const opportunityIds = map(opportunityData, 'id');
    if (!opportunityIds.length) {
      return {
        targeted: 0,
        viewed: 0,
        participated: 0,
      };
    }
    const opportunityEntityType = await this.entityTypeService.getOneEntityType(
      {
        where: { abbreviation: ENTITY_TYPES.IDEA },
      },
    );

    const voteCountsPromise = this.voteService.getVoteCount({
      where: {
        entityObjectId: In(opportunityIds),
        entityType: opportunityEntityType.id,
      },
    });
    const commentCountPromise = this.commentService.getCommentCount({
      where: {
        entityObjectId: In(opportunityIds),
        entityType: opportunityEntityType.id,
      },
    });

    const challengeViewCountPromise = this.challengeService.getOneChallenge({
      where: { id: params.challenge },
      select: ['viewCount'],
    });
    const [voteCount, commentCount, challengeViewCount] = await Promise.all([
      voteCountsPromise,
      commentCountPromise,
      challengeViewCountPromise,
    ]);

    const totalParticipatedCount =
      voteCount + commentCount + opportunityData.length;

    return {
      targeted: 0,
      viewed: parseInt(challengeViewCount.viewCount.toString()),
      participated: totalParticipatedCount,
    };
  }
  async getActivitySummary(params: {
    challenge?: number;
    community: number;
  }): Promise<{}> {
    let where = {};
    where = { community: params.community };
    if (params.challenge) {
      where = { where, ...{ challenge: params.challenge } };
    }
    const opportunityData = await this.opportunityService.getOpportunities({
      where: where,
      select: ['id'],
    });
    const opportunityIds = map(opportunityData, 'id');
    if (!opportunityIds.length) {
      return {
        counts: {
          submissions: 0,
          comments: 0,
          votes: 0,
          shares: 0,
          ratings: 0,
        },
        chartData: {},
      };
    }
    const opportunityEntityType = await this.entityTypeService.getOneEntityType(
      {
        where: { abbreviation: ENTITY_TYPES.IDEA },
      },
    );
    const votesByDateCountPromise = this.voteService.getVoteCountsByDate(
      opportunityEntityType.id,
      opportunityIds,
    );
    const shareByDateCountPromise = this.shareService.getShareCountsByDate(
      opportunityEntityType.id,
      opportunityIds,
    );
    const opportunitySubmissionByDateCountPromise = this.opportunityService.getOpportunityCountsByDate(
      opportunityIds,
    );
    const commentByDateCountPromise = this.commentService.getCommentCountsByDate(
      opportunityEntityType.id,
      opportunityIds,
    );
    const [
      votesByDateCount,
      shareByDateCount,
      opportunitySubmissionByDateCount,
      commentByDateCount,
    ] = await Promise.all([
      votesByDateCountPromise,
      shareByDateCountPromise,
      opportunitySubmissionByDateCountPromise,
      commentByDateCountPromise,
    ]);
    votesByDateCount.map(function(obj) {
      obj['type'] = 'votes';
    });
    shareByDateCount.map(function(obj) {
      obj['type'] = 'shares';
    });
    opportunitySubmissionByDateCount.map(function(obj) {
      obj['type'] = 'submissions';
    });
    commentByDateCount.map(function(obj) {
      obj['type'] = 'comments';
    });
    const prevMonthDates = UtilsService.getPastDatesByMonths(1);
    const [voteCount, commentCount, shareCount] = [
      sumBy(votesByDateCount, 'count'),
      sumBy(commentByDateCount, 'count'),
      sumBy(shareByDateCount, 'count'),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allDataForChart: any = [
      ...opportunitySubmissionByDateCount,
      ...commentByDateCount,
      ...votesByDateCount,
      ...shareByDateCount,
    ];
    allDataForChart = groupBy(allDataForChart, 'date');

    return {
      counts: {
        submissions: opportunityData.length,
        comments: commentCount,
        votes: voteCount,
        shares: shareCount,
        ratings: 0,
      },
      chartData: {
        ...allDataForChart,
        dateRanges: prevMonthDates,
      },
    };
  }
  async getCommunityGroupsTopEngagement(params: {
    community: number;
    challenge?: number;
  }): Promise<{}> {
    let opportunityIds;
    let entityType;
    if (params.challenge) {
      let where = {};
      where = { where, ...{ challenge: params.challenge } };
      const resultOpportunities = await this.opportunityService.getOpportunities(
        {
          where: where,
          select: ['id'],
        },
      );
      opportunityIds = map(resultOpportunities, 'id');
      entityType = await this.entityTypeService.getOneEntityType({
        where: { abbreviation: ENTITY_TYPES.IDEA },
      });
      if (!opportunityIds.length) {
        return [];
      }
    }
    const data = await this.userActionPointService.getUserActionPointsProcess({
      community: params.community,
      frequency: 'month',
      groupBy: USER_ACTION_POINT_FUNCTION_OPTIONS.GROUPS,
      entityObjectIds:
        opportunityIds && opportunityIds.length ? opportunityIds : '',
      entityObjectType:
        opportunityIds && opportunityIds.length && entityType
          ? entityType['id']
          : '',
    });
    return data;
  }
  async getCommunityUsersTopEngagement(params: {
    community: number;
    challenge?: number;
  }): Promise<{}> {
    let opportunityIds;
    let entityType;
    if (params.challenge) {
      let where = {};
      where = { where, ...{ challenge: params.challenge } };
      const resultOpportunities = await this.opportunityService.getOpportunities(
        {
          where: where,
          select: ['id'],
        },
      );
      opportunityIds = map(resultOpportunities, 'id');
      entityType = await this.entityTypeService.getOneEntityType({
        where: { abbreviation: ENTITY_TYPES.IDEA },
      });
      if (!opportunityIds.length) {
        return [];
      }
    }
    const data = await this.userActionPointService.getUserActionPointsProcess({
      community: params.community,
      frequency: 'month',
      entityObjectIds:
        opportunityIds && opportunityIds.length ? opportunityIds : '',
      entityObjectType:
        opportunityIds && opportunityIds.length && entityType
          ? entityType['id']
          : '',
    });
    return data;
  }
  async getCommunityTopEngagedLocations(params: {
    community: number;
    challenge?: number;
  }): Promise<{}> {
    let opportunityIds;
    let entityType;
    if (params.challenge) {
      let where = {};
      where = { where, ...{ challenge: params.challenge } };
      const resultOpportunities = await this.opportunityService.getOpportunities(
        {
          where: where,
          select: ['id'],
        },
      );
      opportunityIds = map(resultOpportunities, 'id');
      entityType = await this.entityTypeService.getOneEntityType({
        where: { abbreviation: ENTITY_TYPES.IDEA },
      });
      if (!opportunityIds.length) {
        return [];
      }
    }
    const data = await this.userActionPointService.getUserActionPointsProcess({
      community: params.community,
      frequency: 'month',
      groupBy: USER_ACTION_POINT_FUNCTION_OPTIONS.LOCATION,
      entityObjectIds:
        opportunityIds && opportunityIds.length ? opportunityIds : '',
      entityObjectType:
        opportunityIds && opportunityIds.length && entityType
          ? entityType['id']
          : '',
    });
    return data;
  }
  async getCommunityCounts(params: { community: number }): Promise<{}> {
    const option = {
      where: { community: params.community },
    };
    const [
      opportunities,
      challenges,
      shares,
      comments,
      votes,
    ] = await Promise.all([
      this.opportunityService.getOpportunityCount(option),
      this.challengeService.getChallengeCount(option),
      this.shareService.getShareCount(option),
      this.commentService.getCommentCount(option),
      this.voteService.getVoteCount(option),
    ]);
    return {
      opportunities,
      challenges,
      shares,
      comments,
      votes,
    };
  }

  /**
   * Extracts users' counts by their names on from a data grouped by user ids.
   * @param groupedData Data grouped by user ids.
   * @param community Community id.
   */
  async getUsersCountsFromGroupedData(
    groupedData: Dictionary<{}[]>,
    community: number,
  ): Promise<{ title: string; count: number }[]> {
    const userData = await this.userService.getUsersWithCommunity({
      communityId: community,
    });
    const groupedUserData = groupBy(userData, 'id');

    return map(groupedData, (val, key) => ({
      title: `${head(groupedUserData[key]).firstName} ${
        head(groupedUserData[key]).lastName
      }`,
      count: val.length,
    }));
  }

  async getGroupedVoteCounts(
    opportunities: OpportunityEntity[],
    community: number,
    oppoEntityType: EntityTypeEntity,
  ): Promise<{}> {
    const votes = await this.voteService.getVote({
      where: {
        entityObjectId: In(opportunities.map(oppo => oppo.id)),
        entityType: oppoEntityType.id,
        community,
      },
    });
    const votesGrouped: {} = groupBy(votes, 'entityObjectId');
    forEach(votesGrouped, (votes: {}[], oppoId) => {
      votesGrouped[oppoId] = votes.length;
    });
    return votesGrouped;
  }

  async getGroupedCommentsCounts(
    opportunities: OpportunityEntity[],
    community: number,
    oppoEntityType: EntityTypeEntity,
  ): Promise<{}> {
    const comments = await this.commentService.getComments({
      where: {
        entityObjectId: In(opportunities.map(oppo => oppo.id)),
        entityType: oppoEntityType.id,
        community,
      },
    });
    const commentsGrouped: {} = groupBy(comments, 'entityObjectId');
    forEach(commentsGrouped, (votes: {}[], oppoId) => {
      commentsGrouped[oppoId] = votes.length;
    });
    return commentsGrouped;
  }

  async getGroupedViewsCounts(opportunities: OpportunityEntity[]): Promise<{}> {
    const viewsGrouped = {};
    opportunities.forEach(oppo => {
      viewsGrouped[oppo.id] = parseInt(oppo.viewCount.toString());
    });
    return viewsGrouped;
  }

  async getGroupedTotalScores(
    opportunities: OpportunityEntity[],
    community: number,
  ): Promise<{}> {
    const totalScores = await Promise.all(
      opportunities.map(oppo =>
        this.evaluationCriteriaService.getOpportunityEvaluationScore({
          opportunity: oppo.id,
          community,
          returnOpportunityId: true,
        }),
      ),
    );
    const scoresGrouped = {};
    totalScores.forEach(score => {
      scoresGrouped[score['opportunityId']] = get(
        score,
        'opportunityScore.finalScore',
      );
    });
    return scoresGrouped;
  }

  async getGroupedStageScores(
    opportunities: OpportunityEntity[],
    community: number,
  ): Promise<{}> {
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    const totalScores = await Promise.all(
      opportunities.map(oppo =>
        this.evaluationCriteriaService.getEvaluationsEntityScores({
          opportunity: oppo.id,
          community,
          entityObjectId: oppo.stageId,
          entityType: stageEntityType.id,
          returnOpportunityId: true,
        }),
      ),
    );
    const scoresGrouped = {};
    totalScores.forEach(score => {
      scoresGrouped[score['opportunityId']] = get(
        score,
        'entityScore.finalScore',
      );
    });
    return scoresGrouped;
  }

  async getCustomFieldBubbleData(
    opportunities: OpportunityEntity[],
    customFieldId: number,
    community: number,
  ): Promise<{}> {
    const customField = await this.customFieldService.getCustomField({
      where: { id: customFieldId, community },
      relations: ['customFieldType'],
    });
    const customFieldData = await this.customFieldDataService.getCustomFieldData(
      {
        where: {
          field: customFieldId,
          opportunity: In(opportunities.map(oppo => oppo.id)),
          community,
        },
      },
    );
    const fieldDataGrouped = {};

    if (
      customField.customFieldType.abbreviation ===
      CUSTOM_FIELD_TYPE_ABBREVIATIONS.NUMBER
    ) {
      customFieldData.map(data => {
        fieldDataGrouped[data.opportunityId] = data.fieldData['number'];
      });
    }

    return fieldDataGrouped;
  }

  async getCriteriaBubbleData(
    opportunities: OpportunityEntity[],
    criteriaId: number,
    community: number,
  ): Promise<{}> {
    const criteriaReponses = await this.opportunityEvaluationResponseService.getOpportunityEvaluationResponses(
      {
        where: {
          evaluationCriteria: criteriaId,
          opportunity: In(opportunities.map(oppo => oppo.id)),
          community,
        },
        relations: ['evaluationCriteria', 'evaluationCriteria.evaluationType'],
      },
    );
    const responsesGrouped = groupBy(criteriaReponses, 'opportunityId');

    const scoresGrouped = {};
    if (criteriaReponses.length) {
      const evalCriteria = head(criteriaReponses).evaluationCriteria;

      forEach(responsesGrouped, (responses, opportunityId) => {
        const scores = head(
          this.evaluationCriteriaService.getAvgCriteriaScores({ responses }),
        );
        if (
          evalCriteria.evaluationType.abbreviation ==
          EVALUATION_TYPE_ABBREVIATIONS.NUMBER
        ) {
          scoresGrouped[opportunityId] = scores.avgScore;
        } else {
          scoresGrouped[opportunityId] = scores.avgNormalizedScore;
        }
      });
    }

    return scoresGrouped;
  }

  mapGroupedDataToBubbleAxis(
    items: {}[],
    oppoColorGrouped: _.Dictionary<{}[]>,
    radiusDataGrouped: {},
    xAxisDataGrouped: {},
    yAxisDataGrouped: {},
    labelAttr: string,
    colorAttr?: string,
  ): {}[] {
    const axisData = [];
    let maxRadius: number;

    items.forEach(item => {
      const data = chain(oppoColorGrouped)
        .get(item['id'], [])
        .map((oppo: OpportunityEntity) => {
          if (
            (get(radiusDataGrouped, oppo.id) ||
              radiusDataGrouped[oppo.id] === 0) &&
            (get(xAxisDataGrouped, oppo.id) ||
              xAxisDataGrouped[oppo.id] === 0) &&
            (get(yAxisDataGrouped, oppo.id) || yAxisDataGrouped[oppo.id] === 0)
          ) {
            const radius = Number.parseFloat(
              radiusDataGrouped[oppo.id].toFixed(2),
            );
            maxRadius = max([maxRadius, radius]);
            return {
              opportunity: oppo,
              x: Number.parseFloat(xAxisDataGrouped[oppo.id].toFixed(2)),
              y: Number.parseFloat(yAxisDataGrouped[oppo.id].toFixed(2)),
              r: radius,
              rawRadiusData: radius,
            };
          }
        })
        .compact()
        .value();

      const randomColor = UtilsService.getRandomColor();

      if (data.length) {
        axisData.push({
          label: get(item, labelAttr, 'Label'),
          backgroundColor: colorAttr
            ? get(item, colorAttr, randomColor)
            : randomColor,
          hoverBackgroundColor: colorAttr
            ? get(item, colorAttr, randomColor)
            : randomColor,
          data,
          radius: 1,
        });
      }
    });

    // Normalizing radius to 30 pixels.
    forEach(axisData, obj => {
      forEach(obj.data, data => {
        data.r = (data.r / maxRadius) * 30;
      });
    });

    return axisData;
  }
}

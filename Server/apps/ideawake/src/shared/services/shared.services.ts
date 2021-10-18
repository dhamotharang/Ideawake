import { Injectable } from '@nestjs/common';
import { Between, In, Not } from 'typeorm';
import { OpportunityService } from '../../modules/opportunity/opportunity.service';
import * as _ from 'lodash';
import {
  CHALLENGE_SORTING,
  ENTITY_TYPES,
  TIME_LIMITS,
} from '../../common/constants/constants';
import { EntityMetaService } from './EntityMeta.service';
import { DefaultSort } from '../../enum/default-sort.enum';
import { CustomFieldDataService } from '../../modules/customField/customFieldData.service';
import { EntityExperienceSettingService } from '../../modules/entityExperienceSetting/entityExperienceSetting.service';
import { Request } from 'express';
import { OpportunityEntity } from '../../modules/opportunity/opportunity.entity';
import { OpportunityTypeService } from '../../modules/opportunityType/opportunityType.service';

@Injectable()
export class SharedService {
  constructor(
    private readonly opportunityService: OpportunityService,
    private readonly opportunityTypeService: OpportunityTypeService,
    public readonly customFieldDataService: CustomFieldDataService,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
  ) {}

  async getAllOpportunities(
    queryParams,
    req: Request,
    relations?: string[],
    ignoreDefRelations?: boolean,
    ignoreVisibilityPerm?: boolean,
  ): Promise<{
    data: OpportunityEntity[];
    count: number;
  }> {
    relations = relations || [];
    if (!ignoreDefRelations) {
      relations = relations.concat([
        'opportunityAttachments',
        'stage',
        'stage.status',
        'opportunityType',
      ]);
    }

    const options = {
      relations: relations ? relations : [],
      where: {},
      order: {},
      take: '',
      skip: '',
    };

    // Filter On Post Type
    if (queryParams.isFilterOnOppoType && queryParams.oppoTypeId) {
      const opportunityType = await this.opportunityTypeService.getOpportunityType(
        {
          where: {
            id: queryParams.oppoTypeId,
            community: req['userData'].currentCommunity,
          },
        },
      );
      if (opportunityType) {
        const linkableTypes = _.concat(
          queryParams.oppoTypeId,
          opportunityType.linkableTypes,
        );
        queryParams.opportunityType = In(linkableTypes);
      }
    }

    // Default pagination setting
    options.take = queryParams.take;
    options.skip = queryParams.skip || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filteredIds: any[];

    // Adding this for the mentioned filters [bookmarkedByMe,followedByMe,
    // votedFor,postedByMe] to extract Opportunity Ids to be passed in main
    // query before applying other filters to optimize data.
    if (
      queryParams.bookmarkedByMe ||
      queryParams.followedByMe ||
      queryParams.votedFor ||
      queryParams.postedByMe
    ) {
      filteredIds = await this.opportunityService.getOpportunityFilteredData({
        challenge: queryParams.challenge,
        challenges: queryParams.challenges,
        community: queryParams.community,
        bookmarkedByMe: queryParams.bookmarkedByMe,
        followedByMe: queryParams.followedByMe,
        votedFor: queryParams.votedFor,
        postedByMe: queryParams.postedByMe,
        userData: req['userData'],
      });
      // Setting extracted filterIds from above function in queryParams object
      queryParams.id = [...(queryParams.id || []), ...filteredIds];
      if (!queryParams.id.length) {
        queryParams.id = [null];
      }
    }

    // Applying Custom-field filters condition
    let customFieldSort = false;
    let updatedFilteredIds = [];
    if (queryParams.customFields && queryParams.customFields.length) {
      // Check whether sorting by custom field filters is needed or not.
      customFieldSort = queryParams.customFields.filter(
        field => field.numValueSort,
      ).length
        ? true
        : false;

      // Filtering opportunity ids.
      updatedFilteredIds = await this.customFieldDataService.filterOpportunitiesByFieldData(
        {
          filters: queryParams.customFields,
          includedOpportunities: filteredIds,
          community: queryParams.community,
        },
      );
      // Replacing the selected Ids as it is filtered from the extracted `filterIds` variable while ignoring the fact if `filterIds` is empty or not !
      if (updatedFilteredIds.length) {
        queryParams.id = updatedFilteredIds;
      } else {
        queryParams.id = [null];
      }
    }

    // Verifying object type
    if (_.get(queryParams, 'id') && typeof queryParams.id === 'object') {
      queryParams.id = In(queryParams.id);
    }
    if (
      _.get(queryParams, 'opportunityTypes') &&
      typeof queryParams.opportunityTypes === 'object'
    ) {
      queryParams.opportunityType = In(queryParams.opportunityTypes);
    }

    if (queryParams.workflow == -1) {
      queryParams.workflow = null;
    }

    let filterStatuses: [] = [];
    if (
      _.get(queryParams, 'statuses') &&
      typeof queryParams.statuses === 'object'
    ) {
      filterStatuses = queryParams.statuses.map(status => parseInt(status));
      delete queryParams.statuses;
    }
    let filterTags: [] = [];
    if (_.get(queryParams, 'tags') && typeof queryParams.tags === 'object') {
      filterTags = queryParams.tags.map(tag => parseInt(tag));
      delete queryParams.tags;
    }

    options.where = {
      ...queryParams,
    };

    /* Date Filters */
    let dateFilter = {};
    // const groupedAllFollowersFinal = {};

    if (queryParams.fromDate || queryParams.toDate) {
      if (queryParams.fromDate && queryParams.toDate) {
        dateFilter = {
          createdAt: Between(
            queryParams.fromDate + ` ${TIME_LIMITS.START}`,
            queryParams.toDate + ` ${TIME_LIMITS.END}`,
          ),
        };
      } else {
        dateFilter = {
          createdAt: Between(
            queryParams.fromDate
              ? queryParams.fromDate + ` ${TIME_LIMITS.START}`
              : queryParams.toDate + ` ${TIME_LIMITS.START}`,
            queryParams.fromDate
              ? queryParams.fromDate + ` ${TIME_LIMITS.END}`
              : queryParams.toDate + ` ${TIME_LIMITS.END}`,
          ),
        };
      }
    }

    const sortClause = {};
    if (
      queryParams.sortBy &&
      queryParams.sortType &&
      queryParams.sortBy === 'createdAt'
    ) {
      sortClause[`opportunity.${queryParams.sortBy}`] = queryParams.sortType;
      options.order = {
        ...sortClause,
      };
    } else {
      if (
        queryParams.challenge ||
        (queryParams.challenges &&
          queryParams.challenges.length == 1 &&
          !_.includes(queryParams.challenges, null))
      ) {
        // Finding followed challenges
        const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
          ENTITY_TYPES.CHALLENGE,
        );
        const experienceSettings = await this.entityExperienceSettingService.getEntityExperienceSetting(
          {
            where: {
              entityType: challengeEntityType.id,
              entityObjectId: queryParams.challenge
                ? queryParams.challenge
                : queryParams.challenges[0],
              community: queryParams.community,
            },
          },
        );
        if (
          CHALLENGE_SORTING[experienceSettings.defaultSort] &&
          CHALLENGE_SORTING[experienceSettings.defaultSort].key
        ) {
          queryParams.sortBy =
            CHALLENGE_SORTING[experienceSettings.defaultSort].key;
          queryParams.sortType =
            CHALLENGE_SORTING[experienceSettings.defaultSort].type;

          if (
            experienceSettings.defaultSort === DefaultSort.NEWEST ||
            experienceSettings.defaultSort === DefaultSort.OLDEST
          ) {
            options.order = {
              ...sortClause,
              [queryParams.sortBy]: queryParams.sortType,
            };
          }
        } else {
          options.order = { ...sortClause, ['opportunity.id']: 'DESC' };
        }
      } else if (queryParams.sortBy !== 'random') {
        sortClause['opportunity.createdAt'] = 'DESC';
        options.order = {
          ...sortClause,
        };
      }
    }
    options.where = {
      ...options.where,
      ...dateFilter,
      ...(queryParams.isFilterOnOppoType &&
        queryParams.exludedId && { id: Not(queryParams.exludedId) }),
    };

    /* Date Filters */

    delete options.where['take'];
    delete options.where['skip'];

    let resultOpportunities = await this.opportunityService.searchOpportunitiesWithCountOptimize(
      {
        mainTableWhereFilters: options.where,
        // take: parseInt(options.take),
        // skip: parseInt(options.skip),
        orderBy: options.order,
        statuses: filterStatuses,
        tags: filterTags,
        challenges: queryParams.challenges ? queryParams.challenges : [],
        // opportunityIds: filteredOpportunityIds,
      },
    );

    // Check visibility permissions for opportunities.
    if (resultOpportunities.length && !ignoreVisibilityPerm) {
      const permissions = await this.opportunityService.getOpportunityPermissionsBulk(
        {
          opportunityIds: resultOpportunities.map(opp => opp.id),
          userId: req['userData'].id,
          community: req['userData'].currentCommunity,
          includeVisibilitySettings: true,
          includeStageTabPermissions: false,
          includeExpSettings: false,
        },
      );
      const permissionsGrouped = _.groupBy(permissions, 'opportunityId');

      resultOpportunities = resultOpportunities.filter(opportunity =>
        permissionsGrouped[opportunity.id]
          ? _.head(permissionsGrouped[opportunity.id]).permissions
              .viewOpportunity
          : false,
      );
    }
    // ---

    let opportunityIds = [];
    if (resultOpportunities.length) {
      opportunityIds = _.map(resultOpportunities, 'id');
    }

    // Sorting by comments or votes.
    if (
      queryParams.sortBy &&
      queryParams.sortType &&
      (queryParams.sortBy === 'comment' || queryParams.sortBy === 'vote') &&
      opportunityIds.length
    ) {
      const [commentCount, voteCount] = await Promise.all([
        this.opportunityService.getCommentCount({
          opportunityIds: opportunityIds,
          isDeleted: false,
        }),
        this.opportunityService.getVoteCount(opportunityIds),
      ]);
      const commentCountTemp = _.keyBy(commentCount, 'opportunity_id');
      const voteCountTemp = _.keyBy(voteCount, 'opportunity_id');

      for (const oppo of resultOpportunities) {
        oppo['comment'] = parseInt(
          (_.get(commentCountTemp, `${oppo.id}.comment`, '') as string) || '0',
        );
        oppo['vote'] = parseInt(
          (_.get(voteCountTemp, `${oppo.id}.vote`, '') as string) || '0',
        );
      }

      resultOpportunities = _.orderBy(
        resultOpportunities,
        item => _.get(item, queryParams.sortBy) || 0,
        [_.toLower(queryParams.sortType) as 'asc' | 'desc'],
      );
    }

    // Sorting by custom field filter.
    if (customFieldSort) {
      resultOpportunities = _.sortBy(resultOpportunities, [
        (opportunity): number =>
          _.findIndex(
            updatedFilteredIds,
            filteredId => filteredId === opportunity.id,
          ),
      ]);
    }

    // Sorting by opportunity scores.
    if (['currStageScore', 'totalScore'].includes(queryParams.sortBy)) {
      resultOpportunities = _.orderBy(
        resultOpportunities,
        item => _.get(item, queryParams.sortBy) || 0,
        [_.toLower(queryParams.sortType) as 'asc' | 'desc'],
      );
    }

    // Refining preselected ids.
    let preselectedIds;
    if (queryParams.preselectAllIds) {
      preselectedIds = resultOpportunities.map(oppo => oppo.id);
    } else if (_.get(queryParams, 'preselectIds.length')) {
      preselectedIds = _.intersection(
        resultOpportunities.map(oppo => oppo.id),
        queryParams.preselectIds,
      );
    }

    // Applying pagination.
    const paginatedData = options.take
      ? resultOpportunities.slice(
          parseInt(options.skip),
          parseInt(options.skip) + parseInt(options.take),
        )
      : resultOpportunities;

    // Storing sorted index of opportunitis in an object for O(1) quick access.
    const paginatedOppoNums = {};
    paginatedData.forEach((oppo, index) => {
      paginatedOppoNums[oppo.id] = index;
    });

    let finalOpposWithJoins = [];
    if (paginatedData.length) {
      finalOpposWithJoins = await this.opportunityService.getSimpleOpportunities(
        {
          where: { id: In(paginatedData.map(oppo => oppo.id)) },
          relations,
        },
      );
      // Sort oppos again based on previous sort results..
      finalOpposWithJoins = _.sortBy(finalOpposWithJoins, [
        (oppo): number =>
          _.get(paginatedOppoNums, oppo.id, finalOpposWithJoins.length),
      ]);
    }

    return {
      data: finalOpposWithJoins,
      count: resultOpportunities.length,
      ...(preselectedIds && { preselectedIds }),
    };
  }
}

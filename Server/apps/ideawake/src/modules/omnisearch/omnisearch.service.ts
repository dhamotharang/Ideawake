import { Injectable } from '@nestjs/common';
import { get, keyBy, uniqBy } from 'lodash';
import { In } from 'typeorm';
import { INDEXES } from '../../common/constants/constants';
import { SearchResultTypeEnum } from '../../enum';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { ChallengeService } from '../challenge/challenge.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { UserService } from '../user/user.service';
import { SearchResponseInterface } from './interfaces';

@Injectable()
export class OmnisearchService {
  constructor(
    public readonly elasticSearchService: ElasticSearchService,
    public readonly opportunityService: OpportunityService,
    public readonly challengeService: ChallengeService,
    public readonly userService: UserService,
  ) {}

  /**
   * Perform Search accross entities.
   * @param params Search Params (including search query, community and others).
   */
  async search(params: {
    query: string;
    community: number;
    userId: number;
  }): Promise<SearchResponseInterface> {
    const rawResults = await this.elasticSearchService.search({
      query: params.query,
      community: params.community,
      isDeleted: false,
      index: [INDEXES.OPPORTUNITY, INDEXES.CHALLENGE, INDEXES.USER],
      fields: ['title', 'description', 'additionalBrief', '*Name', 'email'],
      includeOppId: true,
    });

    const searchResults = uniqBy(rawResults.results, res =>
      [res.index, res.result['id']].join(),
    );

    const [opportunityRes, challengeRes, userRes] = [
      this.filterResults(searchResults, SearchResultTypeEnum.OPPORTUNITY),
      this.filterResults(searchResults, SearchResultTypeEnum.CHALLENGE),
      this.filterResults(searchResults, SearchResultTypeEnum.USER),
    ];

    // Checking permissions for visibility of the results.
    const defaultFalsyPerm = {
      permissions: { viewOpportunity: false, viewChallenge: false },
    };
    let oppoVisbleResults = [];
    let challengeVisibleRes = [];

    // Filtering out the opportunities that are not visible to user.
    if (opportunityRes.length) {
      const permissions = await this.opportunityService.getOpportunityPermissionsBulk(
        {
          opportunityIds: opportunityRes.map(oppRes =>
            parseInt(oppRes.result['id']),
          ),
          userId: params.userId,
          community: params.community,
          includeVisibilitySettings: true,
          includeStageTabPermissions: false,
          includeExpSettings: false,
        },
      );
      const oppoPermissionsGrouped = keyBy(permissions, 'opportunityId');

      oppoVisbleResults = opportunityRes.filter(
        oppRes =>
          get(oppoPermissionsGrouped, oppRes.result['id'], defaultFalsyPerm)
            .permissions.viewOpportunity,
      );
    }

    // Filtering out the challenges that are not visible to user.
    if (challengeRes.length) {
      const permissions = await this.challengeService.getPermissionsBulk({
        challengeIds: challengeRes.map(challenge =>
          parseInt(challenge.result['id']),
        ),
        userId: params.userId,
        community: params.community,
        includeVisibilitySettings: true,
        includeExpSettings: false,
      });
      const permissionGrouped = keyBy(permissions, 'challengeId');

      challengeVisibleRes = challengeRes.filter(
        challenge =>
          get(permissionGrouped, challenge.result['id'], defaultFalsyPerm)
            .permissions.viewChallenge,
      );
    }

    const [opportunities, challenges, users] = await Promise.all([
      oppoVisbleResults.length
        ? this.opportunityService.getSimpleOpportunities({
            where: {
              id: In(oppoVisbleResults.map(res => res.result['id'])),
              community: params.community,
              isDeleted: false,
              draft: false,
            },
            relations: ['opportunityType', 'opportunityAttachments'],
          })
        : [],
      challengeVisibleRes.length
        ? this.challengeService.getChallenges({
            where: {
              id: In(challengeVisibleRes.map(res => res.result['id'])),
              community: params.community,
              isDeleted: false,
              draft: false,
            },
            relations: ['opportunityType'],
          })
        : [],
      userRes.length
        ? this.userService.getUsers({
            where: {
              id: In(userRes.map(res => res.result['id'])),
              community: params.community,
            },
            relations: ['profileImage'],
          })
        : [],
    ]);

    const opportunitiesGrouped = keyBy(opportunities, 'id');
    const challengesGrouped = keyBy(challenges, 'id');
    const usersGrouped = keyBy(users, 'id');

    const finalResults = [];

    // Transforming the results.
    searchResults.forEach(result => {
      if (
        result.index === SearchResultTypeEnum.OPPORTUNITY &&
        opportunitiesGrouped[result.result['id']]
      ) {
        finalResults.push({
          type: SearchResultTypeEnum.OPPORTUNITY,
          data: opportunitiesGrouped[result.result['id']],
        });
      } else if (
        result.index === SearchResultTypeEnum.CHALLENGE &&
        challengesGrouped[result.result['id']]
      ) {
        finalResults.push({
          type: SearchResultTypeEnum.CHALLENGE,
          data: challengesGrouped[result.result['id']],
        });
      } else if (
        result.index === SearchResultTypeEnum.USER &&
        usersGrouped[result.result['id']]
      ) {
        finalResults.push({
          type: SearchResultTypeEnum.USER,
          data: usersGrouped[result.result['id']],
        });
      }
    });

    return {
      results: finalResults,
      count: finalResults.length,
    };
  }

  /**
   * Filter search results for a given index.
   * @param searchResults Search Results to filter from.
   * @param filterIndex Index for which results need to be filtered.
   */
  private filterResults(
    searchResults: Array<{ index: string; result: {} }>,
    filterIndex: SearchResultTypeEnum,
  ): Array<{ index: string; result: {} }> {
    const filteredRes = searchResults.filter(res => res.index === filterIndex);
    return uniqBy(filteredRes, 'result.id');
  }
}

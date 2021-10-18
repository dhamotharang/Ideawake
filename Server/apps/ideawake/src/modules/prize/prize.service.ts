import { Injectable, BadRequestException } from '@nestjs/common';
import { PrizeRepository } from './prize.repository';
import { PrizeEntity } from './prize.entity';
import { PrizeCategoryRepository } from './prizeCategory.repository';
import { PrizeCategoryEntity } from './prizeCategory.entity';
import * as _ from 'lodash';
import { CommunityService } from '../community/community.service';
import {
  PRIZE_CANDIDATE_TYPE,
  ENTITY_TYPES,
  ACTION_TYPES,
} from '../../common/constants/constants';
import { ParticipantTypeEnum } from '../../enum/participant-type.enum';
import { CircleService } from '../circle/circle.service';
import { In } from 'typeorm';
import { PrizeCandidateInterface } from './interfaces/prizeCandidate.interface';
import { PrizeAwardeeEntity } from './prizeAwardee.entity';
import { AddPrizeAwardeeDto } from './dto/AddPrizeAwardeeDto';
import { PrizeAwardeeRepository } from './prizeAwardee.repository';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { UserService } from '../user/user.service';
import { OpportunityUserService } from '../opportunityUser/opportunityUser.service';
import { OpportunityUserType } from '../../enum/opportunity-user-type.enum';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { OpportunityService } from '../opportunity/opportunity.service';
import { UtilsService } from '../../providers/utils.service';

@Injectable()
export class PrizeService {
  constructor(
    public readonly prizeRepository: PrizeRepository,
    public readonly prizeCategoryRepository: PrizeCategoryRepository,
    public readonly prizeAwardeeRepository: PrizeAwardeeRepository,
    public readonly communityService: CommunityService,
    public readonly circleService: CircleService,
    public readonly userService: UserService,
    public readonly opportunityUserService: OpportunityUserService,
    public readonly opportunityService: OpportunityService,
  ) {}

  /**
   * Get prizes
   */
  async getPrizes(options: {}): Promise<PrizeEntity[]> {
    return this.prizeRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'prize',
        ),
      }),
    });
  }

  /**
   * Get a single prize
   */
  async getOnePrize(options: {}): Promise<PrizeEntity> {
    return this.prizeRepository.findOne({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'prize',
        ),
      }),
    });
  }

  /**
   * Get prize categories
   */
  async getAllCategories(options: {}): Promise<PrizeCategoryEntity[]> {
    return this.prizeCategoryRepository.find(options);
  }

  /**
   * Get prizes
   */
  async getPrizeAwardees(options: {}): Promise<PrizeAwardeeEntity[]> {
    return this.prizeAwardeeRepository.find(options);
  }

  /**
   * Get counts of prizes in the given challenges.
   * @param params Options containing the challenges for which counts have to be fetched.
   */
  async getChallengesPrizesCount(params: {
    challengeIds: number[];
    communityId: number;
    isDeleted?: boolean;
  }): Promise<{ challengeId: number; count: number }[]> {
    if (!_.get(params.challengeIds, 'length')) return [];

    const query = this.prizeRepository
      .createQueryBuilder('prize')
      .select(['prize.challengeId AS challenge_id', 'COUNT(prize.id) AS count'])
      .where('prize.communityId = :communityId', {
        communityId: params.communityId,
      })
      .andWhere(`prize.challengeId IN (:...challengeIds)`, {
        challengeIds: params.challengeIds,
      });

    if (params.hasOwnProperty('isDeleted')) {
      query.andWhere('prize.isDeleted = :isDeleted', {
        isDeleted: params.isDeleted,
      });
    }

    const rawRes = await query.groupBy('prize.challengeId').getRawMany();

    // Mapping & parsing keys from raw results.
    return rawRes.map(res => ({
      challengeId: res['challenge_id'],
      count: parseInt(res['count']),
    }));
  }

  /**
   * Gets Users and Opportunity Candidates for a prize by prize id.
   * @param prizeId Prize Id to find candidates for.
   * @returns {PrizeCandidateInterface} Prize Candidates.
   */
  async getPrizeCandidates(
    prizeId: number,
  ): Promise<PrizeCandidateInterface[]> {
    const prize = await this.getOnePrize({
      where: { id: prizeId },
      relations: [
        'challenge',
        'challenge.challengeParticipant',
        'challenge.challengeOpportunities',
        'challenge.challengeOpportunities.opportunityType',
      ],
    });
    let userCandidates = [];

    // Getting all community users.
    const communityData = await this.communityService.getCommunityUsers({
      communityId: prize.communityId,
    });
    const communityUsers = _.map(
      _.head(_.map(communityData, 'communityUsers')),
      'user',
    );

    const challengeParticipants = prize.challenge.challengeParticipant;
    if (challengeParticipants.length) {
      // Gathering ids for sponsors, moderators and user participants.
      let tempUserCandidates = prize.challenge.sponsors
        .concat(prize.challenge.moderators)
        .concat(
          challengeParticipants
            .filter(
              participant => participant.type === ParticipantTypeEnum.USER,
            )
            .map(participant => participant.participantId),
        );

      // Gathering ids for all users in group participants.
      const groupParticipants = challengeParticipants
        .filter(participant => participant.type === ParticipantTypeEnum.GROUP)
        .map(participant => participant.participantId);
      if (groupParticipants.length) {
        const groupUsers = _.flatMapDeep(
          (await this.circleService.getCircles({
            where: { id: In(groupParticipants) },
            relations: ['circleUsers'],
          })).map(group =>
            group.circleUsers.map(circleUser => circleUser.userId),
          ),
        );
        tempUserCandidates = tempUserCandidates.concat(groupUsers);
      }

      // Finding users in Community Users for gathered ids.
      userCandidates = userCandidates.concat(
        tempUserCandidates
          .map(user => ({
            type: PRIZE_CANDIDATE_TYPE.USER,
            candidate: communityUsers.find(comUser => comUser.id === user),
          }))
          .filter(user => user.candidate !== undefined),
      );
    } else {
      // If challenge is open for participation of all community members, then
      // we don't need to add sponsors and moderators separately since they will
      // already be part of community members.
      userCandidates = userCandidates.concat(
        communityUsers.map(user => ({
          type: PRIZE_CANDIDATE_TYPE.USER,
          candidate: user,
        })),
      );
    }

    const opportunityCandidates = prize.challenge.challengeOpportunities.map(
      opportunity => ({
        type: PRIZE_CANDIDATE_TYPE.OPPORTUNITY,
        candidate: opportunity,
      }),
    );

    // Filtering unique candidates.
    let candidates = userCandidates.concat(opportunityCandidates);
    candidates = candidates.filter(
      (value, index) => _.findIndex(candidates, value) === index,
    );

    return candidates;
  }

  /**
   * Add prize
   */
  async addPrize(data: {}): Promise<PrizeEntity> {
    data['isDeleted'] = false;
    const prizeCreated = this.prizeRepository.create(
      UtilsService.replaceJoinColumnsForQueries(data, 'prize'),
    );
    return this.prizeRepository.save(prizeCreated);
  }

  /**
   * Award prize to Users and Opportunities and stores relevant awardees.
   * @param {AddPrizeAwardeeDto} data Awardees Data.
   * @returns Stored awardees.
   * @throws BadRequestException in case of insufficient available winners.
   */
  async addPrizeAwardee(
    data: AddPrizeAwardeeDto,
    actorData,
  ): Promise<PrizeAwardeeEntity[]> {
    const prize = await this.getOnePrize({
      where: { id: data.prizeId },
      relations: ['community'],
    });
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    const userEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.USER,
    );

    const userAwardeesRaw = data.awardees.filter(
      awardee => awardee.type === PRIZE_CANDIDATE_TYPE.USER,
    );
    const opportunityAwardeesRaw = _.difference(data.awardees, userAwardeesRaw);
    let transformedData = [];

    // Award Prizes to users type awardees.
    let userAwardees = [];
    if (userAwardeesRaw.length) {
      const userAwardeesIds = userAwardeesRaw.map(
        awardee => awardee.candidateId,
      );
      userAwardees = await this.userService.getUsers({
        where: { id: In(userAwardeesIds) },
      });
      transformedData = transformedData.concat(
        userAwardeesRaw.map(awardee => ({
          entityType: userEntityType,
          entityObjectId: awardee.candidateId,
          user: userAwardees.find(u => u.id === awardee.candidateId),
          message: data.message,
          prize: prize,
          community: prize.community,
          isDeleted: false,
        })),
      );
    }

    // Award Prizes to opportunity type awardees.
    let opportunities = [];
    if (opportunityAwardeesRaw.length) {
      const opportunityAwardeesIds = opportunityAwardeesRaw.map(
        awardee => awardee.candidateId,
      );
      opportunities = await this.opportunityService.getOpportunities({
        where: { id: In(opportunityAwardeesIds) },
      });
      const opportunityAwardees = await this.opportunityUserService.getOpportunityUsers(
        {
          where: {
            opportunity: In(opportunityAwardeesIds),
            opportunityUserType: OpportunityUserType.SUBMITTER,
          },
          relations: ['user'],
        },
      );
      transformedData = transformedData.concat(
        opportunityAwardees.map(oppUser => ({
          entityType: opportunityEntityType,
          entityObjectId: oppUser.opportunityId,
          user: oppUser.user,
          message: data.message,
          prize: prize,
          community: prize.community,
          isDeleted: false,
        })),
      );
    }

    // Check available winners.
    const existingAwardees = await this.getPrizeAwardees({ prize });
    if (prize.totalWinners < existingAwardees.length + transformedData.length) {
      throw new BadRequestException('Insufficient winners available.');
    }

    // Generate Awardees.
    const awardeesCreated = this.prizeAwardeeRepository.create(transformedData);
    const awardeesSaved = await this.prizeAwardeeRepository.save(
      awardeesCreated,
    );

    // Generate relevant notifications to awardees.
    actorData['community'] = prize.communityId;
    const prizeCopy = _.cloneDeep(prize);
    delete prizeCopy.community;
    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const doneOpportunities = [];

    awardeesSaved.map(awardee => {
      let isOppDone = false;
      if (awardee.entityType.abbreviation === ENTITY_TYPES.IDEA) {
        isOppDone = doneOpportunities.includes(awardee.entityObjectId);
        if (!isOppDone) {
          doneOpportunities.push(awardee.entityObjectId);
        }
      }

      const entityOperendObject = {
        awardeeEntityType: awardee.entityType,
        awardee:
          awardee.entityType.abbreviation === ENTITY_TYPES.USER
            ? userAwardees.find(awUser => awUser.id === awardee.entityObjectId)
            : opportunities.find(awOpp => awOpp.id === awardee.entityObjectId),
        prize: prizeCopy,
      };

      const awardeeCopy: {} = _.cloneDeep(awardee);
      awardeeCopy['entityType'] = challengeEntityType.id;
      awardeeCopy['entityObjectId'] = prize.challengeId;

      NotificationHookService.notificationHook({
        actionData: awardeeCopy,
        actorData: actorData,
        actionType: ACTION_TYPES.AWARD_PRIZE,
        invertUser: true,
        entityOperendObject,
        isActivity: !isOppDone,
      });
    });

    return awardeesSaved;
  }

  /**
   * Bulk Add prize
   */
  async bulkAddPrizes(data: {}[]): Promise<PrizeEntity[]> {
    data = data.map(prize => ({ ...prize, isDeleted: false }));
    const prizeCreated = this.prizeRepository.create(
      UtilsService.replaceJoinColumnsForQueries(data, 'prize') as {}[],
    );
    return this.prizeRepository.save(prizeCreated);
  }

  /**
   * Add prize category
   */
  async addPrizeCategory(data: {}): Promise<PrizeCategoryEntity> {
    data['abbreviation'] = _.snakeCase(data['title']);
    const categoryCreated = this.prizeCategoryRepository.create(data);
    return this.prizeCategoryRepository.save(categoryCreated);
  }

  /**
   * Update prize
   */
  async updatePrize(options: {}, data: {}): Promise<{}> {
    return this.prizeRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'prize'),
      UtilsService.replaceJoinColumnsForQueries(data, 'prize'),
    );
  }

  /**
   * Delete prize
   */
  async softDeletePrize(options: {}): Promise<{}> {
    return this.updatePrize(options, { isDeleted: true });
  }
}

import { Injectable } from '@nestjs/common';
import { OpportunityLinkRepository } from './opportunityLink.repository';
import { DeepPartial, DeleteResult, FindConditions } from 'typeorm';
import { OpportunityLinkEntity } from './opportunityLink.entity';
import {
  OpportunityLinkRelationEnum,
  OpportunityReverseLinkRelationEnum,
} from '../../enum';
import { UtilsService } from '../../providers/utils.service';

@Injectable()
export class OpportunityLinkService {
  constructor(
    public readonly opportunityLinkRepository: OpportunityLinkRepository,
  ) {}

  /**
   * Add an opportunity's link.
   * @param data Data to add.
   * @returns Link object.
   */
  async addOpportunityLink(
    data: DeepPartial<OpportunityLinkEntity[]>,
  ): Promise<OpportunityLinkEntity[]> {
    const opportunityLinksCreated = this.opportunityLinkRepository.create(data);
    return this.opportunityLinkRepository.save(opportunityLinksCreated);
  }

  /**
   * Update Opportunity Link
   */
  async updateOpportunityLink(options: {}, data: {}): Promise<{}> {
    return this.opportunityLinkRepository.update(options, data);
  }

  /**
   * Checks if link already exist
   * @param params Options on which to search existing opportunity link.
   */
  async checkOpportunityLink(params: {
    opportunityId: number;
    communityId: number;
    linkedOpportunityId: number;
    relation: OpportunityLinkRelationEnum;
  }): Promise<boolean> {
    const options = {
      where: {
        ...params,
      },
    };
    const opportunityLink = await this.getOpportunityLink(options);
    return opportunityLink ? true : false;
  }

  /**
   * Get single opportunity link.
   */
  async getOpportunityLink(options: {}): Promise<OpportunityLinkEntity> {
    return this.opportunityLinkRepository.findOne(options);
  }

  /**
   * Get multiple opportunity link.
   */
  async getOpportunityLinks(options: {}): Promise<OpportunityLinkEntity[]> {
    return this.opportunityLinkRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }

  /**
   * Permanently delete an opportunity's link.
   * @param options Options to search the link.
   * @returns Deletion result and status.
   */
  async deleteOpportunityLink(
    options: FindConditions<OpportunityLinkEntity>,
  ): Promise<DeleteResult> {
    return this.opportunityLinkRepository.delete(options);
  }

  reverseLinkMapping(reverseLinked: OpportunityLinkEntity[]) {
    const mappedReverseLinked = reverseLinked.map(opportunityLink => ({
      ...opportunityLink,
      opportunityId: opportunityLink.linkedOpportunityId,
      opportunity: opportunityLink.linkedOpportunity,
      linkedOpportunityId: opportunityLink.opportunityId,
      linkedOpportunity: opportunityLink.opportunity,
      relation: this.getReverseRelation(opportunityLink.relation),
    }));

    return mappedReverseLinked;
  }

  getReverseRelation(relation) {
    const dataMapper = {
      [OpportunityLinkRelationEnum.RELATED_TO]:
        OpportunityReverseLinkRelationEnum.RELATED_TO,
      [OpportunityLinkRelationEnum.DUPLICATES]:
        OpportunityReverseLinkRelationEnum.DUPLICATES,
      [OpportunityLinkRelationEnum.IS_DUPLICATED_BY]:
        OpportunityReverseLinkRelationEnum.IS_DUPLICATED_BY,
      [OpportunityLinkRelationEnum.ALTERNATIVE_TO]:
        OpportunityReverseLinkRelationEnum.ALTERNATIVE_TO,
      [OpportunityLinkRelationEnum.BLOCKS]:
        OpportunityReverseLinkRelationEnum.BLOCKS,
      [OpportunityLinkRelationEnum.IS_BLOCKED_BY]:
        OpportunityReverseLinkRelationEnum.IS_BLOCKED_BY,
      [OpportunityLinkRelationEnum.HAS_SYNERGIES_WITH]:
        OpportunityReverseLinkRelationEnum.HAS_SYNERGIES_WITH,
    };
    return dataMapper[relation];
  }
}

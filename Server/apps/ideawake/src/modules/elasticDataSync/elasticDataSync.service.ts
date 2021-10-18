import { Injectable } from '@nestjs/common';
import { cloneDeep, forEach, head, map } from 'lodash';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { ChallengeService } from '../challenge/challenge.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ElasticDataSyncService {
  constructor(
    public readonly elasticSearchService: ElasticSearchService,
    public readonly opportunityService: OpportunityService,
    public readonly challengeService: ChallengeService,
    public readonly userService: UserService,
  ) {}

  async addUserData(): Promise<void> {
    //get user data
    const users: UserEntity[] = await this.userService.getUsers({
      relations: ['userCommunities'],
      where: {
        isDeleted: false,
      },
    });
    const updatedUsersArr = [];
    forEach(users, val => {
      const tempUser = cloneDeep({
        id: val.id,
        firstName: val.firstName,
        lastName: val.lastName,
        userName: val.userName,
        email: val.email,
        secondaryEmail: val.secondaryEmail,
        profileBio: val.profileBio,
        skills: val.skills,
        region: val.region,
        country: val.country,
        city: val.city,
        zipCode: val.zipCode,
        timeZone: val.timeZone,
        latLng: val.latLng,
        position: val.position,
        company: val.company,
        isDeleted: val.isDeleted,
        communityId: 0,
      });
      const tempUserComm = map(val.userCommunities, 'communityId');

      if (tempUserComm.length && tempUserComm.length === 1) {
        tempUser.communityId = head(tempUserComm);
        updatedUsersArr.push(cloneDeep(tempUser));
      } else {
        forEach(tempUserComm, val => {
          tempUser.communityId = val;
          updatedUsersArr.push(cloneDeep(tempUser));
        });
      }
    });

    this.elasticSearchService.syncUserData(updatedUsersArr);
  }
  async addChallengeData(): Promise<void> {
    //get user data
    const challenges = await this.challengeService.getChallenges({
      where: { isDeleted: false },
    });

    this.elasticSearchService.syncChallengeData(challenges);
  }
  async addOpportunityData(): Promise<void> {
    //get user data
    const opportunities = await this.opportunityService.getOpportunities({
      where: { isDeleted: false },
    });

    this.elasticSearchService.syncOpportunityData(opportunities);
  }
}

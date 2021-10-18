import { Injectable, ForbiddenException } from '@nestjs/common';
import { CommunityService } from '../../modules/community/community.service';
import { OpportunityService } from '../../modules/opportunity/opportunity.service';
import { ChallengeService } from '../../modules/challenge/challenge.service';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import { PermissionsCondition } from '../../enum/permissions-condition.enum';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly communityService: CommunityService,
    private readonly opportunityService: OpportunityService,
    private readonly challengeService: ChallengeService,
  ) {}

  async verifyPermissions(
    roleLevel: RoleLevelEnum,
    entityObjectId: number,
    userId: number,
    permissionsToCheck: string[],
    condition: string,
  ): Promise<boolean> {
    let permissions;

    if (roleLevel === RoleLevelEnum.community) {
      permissions = await this.communityService.getPermissions(
        entityObjectId,
        userId,
      );
    } else if (roleLevel === RoleLevelEnum.opportunity) {
      permissions = await this.opportunityService.getOpportunityPermissions(
        entityObjectId,
        userId,
      );
    } else if (roleLevel === RoleLevelEnum.challenge) {
      permissions = await this.challengeService.getPermissions(
        entityObjectId,
        userId,
      );
    }

    let isAllowed = false;
    if (condition === PermissionsCondition.OR) {
      isAllowed = permissionsToCheck.some(perm => permissions[perm]);
    } else {
      isAllowed = permissionsToCheck.every(perm => permissions[perm]);
    }

    if (!isAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    return isAllowed;
  }
}

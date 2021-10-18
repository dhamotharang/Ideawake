import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommunityService } from '../modules/community/community.service';
import { RoleLevelEnum } from '../enum/role-level.enum';
import { OpportunityService } from '../modules/opportunity/opportunity.service';
import { ChallengeService } from '../modules/challenge/challenge.service';
import { PermissionsCondition } from '../enum/permissions-condition.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly communityService: CommunityService,
    private readonly opportunityService: OpportunityService,
    private readonly challengeService: ChallengeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleLevel = this._reflector.get<RoleLevelEnum>(
      'roleLevel',
      context.getHandler(),
    );
    const requestKey = this._reflector.get<string>(
      'requestKey',
      context.getHandler(),
    );
    const elementKey = this._reflector.get<string>(
      'elementKey',
      context.getHandler(),
    );
    const permissionsToCheck = this._reflector.get<string[]>(
      'permissionsToCheck',
      context.getHandler(),
    );
    const condition = this._reflector.get<string>(
      'condition',
      context.getHandler(),
    );

    if (!roleLevel) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.userData;

    let permissions;

    if (roleLevel === RoleLevelEnum.community) {
      permissions = await this.communityService.getPermissions(
        request[requestKey][elementKey],
        user.id,
      );
    } else if (roleLevel === RoleLevelEnum.opportunity) {
      permissions = await this.opportunityService.getOpportunityPermissions(
        request[requestKey][elementKey],
        user.id,
      );
    } else if (roleLevel === RoleLevelEnum.challenge) {
      permissions = await this.challengeService.getPermissions(
        request[requestKey][elementKey],
        user.id,
      );
    }

    let isAllowed = false;
    if (condition === PermissionsCondition.OR) {
      isAllowed = permissionsToCheck.some(perm => permissions[perm]);
    } else {
      isAllowed = permissionsToCheck.every(perm => permissions[perm]);
    }

    return isAllowed;
  }
}

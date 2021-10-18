'use strict';

import { IsOptional, IsInt } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetChallengeActorEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;
}
export class GetChallengeActorEngagementQuery {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}
export class GetChallengeActivitySummaryParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;
}
export class GetChallengeActivitySummaryQuery {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}
export class GetCommunityActorEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}
export class GetCommunityGroupsTopEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}
export class GetCommunityUsersTopEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}

export class GetChallengeGroupsTopEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;
}
export class GetChallengeGroupsTopEngagementQuery {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}
export class GetChallengeUsersTopEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;
}
export class GetChallengeUsersTopEngagementQuery {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}

export class GetCommunityRegionsTopEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}
export class GetChallengeRegionsTopEngagementParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;
}
export class GetChallengeRegionsTopEngagementQuery {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;
}

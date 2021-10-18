'use strict';

import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  IsObject,
} from 'class-validator';

export class AnnouncementTargetingDto {
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  individuals: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  groups: number[];

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allCommunityUsers: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  admins: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  moderators: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  challengeAdmins: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  challengeModerators: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  challengeParticipants: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunityOwners: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunityTeam: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunitySubmitters: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  followers: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  voters: boolean;

  @IsObject()
  @IsOptional()
  @ApiModelProperty()
  actionItemRelated: {};
}

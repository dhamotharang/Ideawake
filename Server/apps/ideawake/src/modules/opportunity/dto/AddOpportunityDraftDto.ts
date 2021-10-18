import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  IsInt,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { MentionDto } from '../../mention/dto/MentionDto';

export class AddOpportunityDraftDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  tags: [];

  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityTypeId: number;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  anonymous: number;

  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challengeId: number;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  mentions: MentionDto[];

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  attachments: [];

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  customFieldsData: [];
}

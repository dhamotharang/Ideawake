import { IsNotEmpty, IsNumber, IsEnum, IsInt, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { OpportunityLinkRelationEnum } from '../../../enum';

export class AddOpportunityLinkDto {
  @IsEnum(OpportunityLinkRelationEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  relation: OpportunityLinkRelationEnum;

  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityId: number;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  linkedOpportunityIds: number[];
}

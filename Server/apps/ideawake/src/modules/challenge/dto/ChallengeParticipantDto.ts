'use strict';

import { ParticipantTypeEnum } from '../../../enum/participant-type.enum';
import { IsNumber, IsEnum } from 'class-validator';

export class ChallengeParticipantDto {
  @IsNumber()
  participantId: number;

  @IsEnum(ParticipantTypeEnum)
  type: ParticipantTypeEnum;
}

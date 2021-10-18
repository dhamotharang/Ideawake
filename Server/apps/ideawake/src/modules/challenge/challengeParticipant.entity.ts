import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { ParticipantTypeEnum } from '../../enum/participant-type.enum';
import { ChallengeEntity } from './challenge.entity';

@Entity(TABLES.CHALLENGE_PARTICIPANT)
export class ChallengeParticipantEntity extends CommonEntity {
  @ManyToOne(() => ChallengeEntity, challenge => challenge.challengeParticipant)
  challenge: ChallengeEntity;

  @Column('integer')
  participantId: number;

  @Column({
    type: 'enum',
    enum: ParticipantTypeEnum,
    default: ParticipantTypeEnum.USER,
  })
  type: ParticipantTypeEnum;
}

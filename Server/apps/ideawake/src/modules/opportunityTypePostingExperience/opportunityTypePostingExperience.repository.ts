import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityTypePostingExperienceEntity } from './opportunityTypePostingExperience.entity';

@EntityRepository(OpportunityTypePostingExperienceEntity)
export class OpportunityTypePostingExperienceRepository extends Repository<
  OpportunityTypePostingExperienceEntity
> {}

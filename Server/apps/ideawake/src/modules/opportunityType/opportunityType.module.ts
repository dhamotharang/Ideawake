import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunityTypeRepository } from './opportunityType.repository';
import { OpportunityTypeController } from './opportunityType.controller';
import { OpportunityTypeService } from './opportunityType.service';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { EntityExperienceSettingModule } from '../entityExperienceSetting/entityExperienceSetting.module';
import { CommunityModule } from '../community/community.module';
import { CustomFieldModule } from '../customField/customField.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { StageModule } from '../stage/stage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpportunityTypeRepository]),
    RoleActorsModule,
    forwardRef(() => EntityExperienceSettingModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => CustomFieldModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => StageModule),
  ],
  controllers: [OpportunityTypeController],
  exports: [OpportunityTypeService],
  providers: [OpportunityTypeService],
})
export class OpportunityTypeModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunityUserRepository } from './opportunityUser.repository';
import { OpportunityUserController } from './opportunityUser.controller';
import { OpportunityUserService } from './opportunityUser.service';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { EntityTypeModule } from '../entityType/entity.module';
import { RoleModule } from '../role/role.module';
import { OpportunityTypeModule } from '../opportunityType/opportunityType.module';
import { OpportunityRepository } from '../opportunity/opportunity.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OpportunityUserRepository,
      OpportunityRepository,
    ]),
    forwardRef(() => EntityTypeModule),
    forwardRef(() => RoleModule),
    forwardRef(() => RoleActorsModule),
    forwardRef(() => OpportunityTypeModule),
  ],
  controllers: [OpportunityUserController],
  exports: [OpportunityUserService],
  providers: [OpportunityUserService],
})
export class OpportunityUserModule {}

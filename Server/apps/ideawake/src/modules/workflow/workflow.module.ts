import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowRepository } from './workflow.repository';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { StatusModule } from '../status/status.module';
import { StageModule } from '../stage/stage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowRepository]),
    forwardRef(() => OpportunityModule),
    forwardRef(() => StatusModule),
    forwardRef(() => StageModule),
  ],
  controllers: [WorkflowController],
  exports: [WorkflowService],
  providers: [WorkflowService],
})
export class WorkflowModule {}

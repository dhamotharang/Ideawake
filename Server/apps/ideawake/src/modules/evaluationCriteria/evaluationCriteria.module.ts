import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCriteriaRepository } from './evaluationCriteria.repository';
import { EvaluationCriteriaController } from './evaluationCriteria.controller';
import { EvaluationCriteriaService } from './evaluationCriteria.service';
import { EvaluationTypeRepository } from './evaluationType.repository';
import { EvaluationTypeController } from './evaluationType.controller';
import { EvaluationTypeService } from './evaluationType.service';
import { OpportunityEvaluationResponseService } from './opportunityEvaluationResponse.service';
import { OpportunityEvaluationResponseRepository } from './opportunityEvaluationResponse.repository';
import { EvaluationCriteriaIntegrationService } from './evaluationCriteriaIntegration.service';
import { EvaluationCriteriaIntegrationRepository } from './evaluationCriteriaIntegration.repository';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { OppoEvaluationSummaryRepository } from './oppoEvaluationSummary.repository';
import { OppoCriteriaEvalSummaryRepository } from './oppoCriteriaEvalSummary.repository';
import { OppoEvaluationSummaryService } from './oppoEvaluationSummary.service';
import { OppoCriteriaEvalSummaryService } from './oppoCriteriaEvalSummary.service';
import { EvaluationScoreSyncService } from './evaluationScoreSync.service';
import { StageModule } from '../stage/stage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationTypeRepository,
      EvaluationCriteriaRepository,
      EvaluationCriteriaIntegrationRepository,
      OpportunityEvaluationResponseRepository,
      OppoEvaluationSummaryRepository,
      OppoCriteriaEvalSummaryRepository,
    ]),
    forwardRef(() => OpportunityModule),
    forwardRef(() => StageModule),
  ],
  controllers: [EvaluationCriteriaController, EvaluationTypeController],
  exports: [
    EvaluationTypeService,
    EvaluationCriteriaService,
    EvaluationCriteriaIntegrationService,
    OpportunityEvaluationResponseService,
    OppoEvaluationSummaryService,
    OppoCriteriaEvalSummaryService,
    EvaluationScoreSyncService,
  ],
  providers: [
    EvaluationTypeService,
    EvaluationCriteriaService,
    EvaluationCriteriaIntegrationService,
    OpportunityEvaluationResponseService,
    OppoEvaluationSummaryService,
    OppoCriteriaEvalSummaryService,
    EvaluationScoreSyncService,
  ],
})
export class EvaluationCriteriaModule {}

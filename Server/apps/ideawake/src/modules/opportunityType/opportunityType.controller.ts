import {
  Controller,
  Query,
  Post,
  Body,
  Req,
  Get,
  Param,
  Patch,
  Delete,
  ConflictException,
} from '@nestjs/common';
import { Request } from 'express';
import * as _ from 'lodash';
import {
  AddOpportunityTypeDto,
  EditOpportunityTypeDto,
  OpportunityTypeExperienceSettingDto,
} from './dto';
import { OpportunityTypeService } from './opportunityType.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { CustomFieldIntegrationService } from '../customField/customFieldIntegration.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { ENTITY_TYPES } from '../../common/constants/constants';
import { VisibilityExpFieldIntegrationEnum } from '../../enum/visibility-exp-field-integration.enum';
import { OpportunityFieldLinkageService } from '../customField/opportunityFieldLinkage.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { StageService } from '../stage/stage.service';
import { OpportunityTypeEntity } from './opportunityType.entity';
import { GetBulkOppTypeExpSettingsDto } from './dto/GetBulkOppTypeExpSettingsDto';

@Controller('opportunity-type')
export class OpportunityTypeController {
  constructor(
    private readonly opportunityTypeService: OpportunityTypeService,
    private readonly customFieldIntegrationService: CustomFieldIntegrationService,
    private readonly opportunityFieldLinkageService: OpportunityFieldLinkageService,
    private readonly opportunityService: OpportunityService,
    private readonly stageService: StageService,
  ) {}

  @Post()
  async addOpportunityType(
    @Body() body: AddOpportunityTypeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const isUnique = await this.opportunityTypeService.checkOpportunityType({
      name: body.name,
      isDeleted: false,
      communityId: req['userData'].currentCommunity,
    });

    if (isUnique) {
      throw new ConflictException('Opportunity type name already exists');
    } else {
      const response = await this.opportunityTypeService.addOpportunityType({
        ...body,
        createdBy: req['userData'].id,
        community: req['userData'].currentCommunity,
        isDeleted: false,
        isEnabled: true,
        abbreviation: _.snakeCase(body.name),
        enableDupDetection: true,
        duplicatableTypes: [],
        enableLinking: true,
        linkableTypes: body.linkableTypes,
      });
      this.opportunityTypeService.addOpportunityLinks(body.linkableTypes, {
        id: response.id,
        community: req['userData'].currentCommunity,
        userId: req['userData'].id,
      });
      return ResponseFormatService.responseOk(response, 'Created Successfully');
    }
  }

  @Get()
  async getAllOpportunityTypes(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const opportunityTypes = await this.opportunityTypeService.getOpportunityTypes(
      {
        where: {
          ...queryParams,
          community: req['userData'].currentCommunity,
          isDeleted: queryParams.isDeleted || false,
        },
        relations: ['workflow'],
      },
    );
    return ResponseFormatService.responseOk(opportunityTypes, 'All');
  }

  @Get('experience-settings/:id')
  async getOpportunityTypeExperienceSettings(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const expSettings = await this.opportunityTypeService.getOpportunityTypeExperienceSettings(
      { id: id, community: req['userData'].currentCommunity },
    );
    return ResponseFormatService.responseOk(expSettings, 'All');
  }

  @Post('bulk-experience-settings/')
  async getBulkOpportunityTypeExperienceSettings(
    @Body() body: GetBulkOppTypeExpSettingsDto,
  ): Promise<ResponseFormat> {
    const expSettings = await this.opportunityTypeService.getBulkOpportunityTypeExperienceSettings(
      body,
    );
    return ResponseFormatService.responseOk(
      expSettings,
      'Bulk experience settings for given opportunity types.',
    );
  }

  @Get(':id')
  async getOpportunityType(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const opportunityType = await this.opportunityTypeService.getOpportunityTypes(
      {
        where: { id: id, community: req['userData'].currentCommunity },
        relations: ['workflow'],
      },
    );
    return ResponseFormatService.responseOk(opportunityType, 'All');
  }

  @Patch('experience-settings/:id')
  async updateOpportunityTypeExperienceSettings(
    @Param('id') id: number,
    @Body() body: OpportunityTypeExperienceSettingDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const userId = req['userData'].id;

    const updateData = await this.opportunityTypeService.updateOpportunityTypeExperienceSettings(
      { id: id, community: req['userData'].currentCommunity },
      body,
      userId,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Patch(':id')
  async updateOpportunityType(
    @Param('id') id: string,
    @Body() body: EditOpportunityTypeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    body['updatedBy'] = req['userData'].id;
    if (body.name) {
      body.abbreviation = _.snakeCase(body.name);
    }
    const isUnique = await this.opportunityTypeService.checkOpportunityType({
      name: body.name,
      isDeleted: false,
      communityId: req['userData'].currentCommunity,
      excludedId: parseInt(id),
    });
    if (isUnique) {
      throw new ConflictException('Opportunity type name already exists');
    } else {
      const opportunityTypeFields = _.cloneDeep(body.opportunityTypeFields);
      delete body.opportunityTypeFields;

      const existingOppType = await this.opportunityTypeService.getOpportunityType(
        { where: { id, community: req['userData'].currentCommunity } },
      );
      this.opportunityTypeService.updateOpportunityLinks(
        existingOppType,
        body.linkableTypes,
        {
          id: parseInt(id),
          community: req['userData'].currentCommunity,
          userId: req['userData'].id,
        },
      );

      const updateData = await this.opportunityTypeService.updateOpportunityType(
        { id: id, community: req['userData'].currentCommunity },
        body,
      );

      if (opportunityTypeFields) {
        // Integrating custom field with opportunity type.

        const oppTypeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
          ENTITY_TYPES.OPPORTUNITY_TYPE,
        );

        // Updating existing opportunities field linkages.
        this.updateExistingOpportunitiesLinkedFields({
          opportunityTypeId: parseInt(id),
          opportunityTypeFields,
          oppTypeEntityType,
          community: req['userData'].currentCommunity,
        });

        // Mapping the request data into CustomFieldIntegration object.
        const updatedIntegrationData = _.map(
          opportunityTypeFields,
          (fieldData: {
            field: number;
            opportunityType: number;
            order: number;
            community: number;
            visibilityExperience?: string;
          }) => ({
            field: fieldData.field,
            order: fieldData.order,
            community: fieldData.community,
            entityObjectId: fieldData.opportunityType,
            entityType: oppTypeEntityType,
            visibilityExperience:
              fieldData.visibilityExperience ||
              VisibilityExpFieldIntegrationEnum.SUBMISSION_FORM,
          }),
        );

        await this.customFieldIntegrationService.deleteCustomFieldIntegration({
          entityObjectId: id,
          entityType: oppTypeEntityType,
          community: req['userData'].currentCommunity,
        });
        await this.customFieldIntegrationService.addCustomFieldIntegration(
          updatedIntegrationData,
        );
      }

      // Update workflow for existing opportunities.
      if (body.workflow && body.workflow !== existingOppType.workflowId) {
        const updatedOppType = await this.opportunityTypeService.getOpportunityType(
          { where: { id, community: req['userData'].currentCommunity } },
        );
        this.updateExistingOpportunitiesWorkflow(updatedOppType, req.headers
          .origin as string);
      }

      return ResponseFormatService.responseOk(updateData, '');
    }
  }

  @Delete(':id')
  async removeOpportunityType(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.opportunityTypeService.updateOpportunityType(
      { id: id, community: req['userData'].currentCommunity },
      { isDeleted: true, updatedBy: req['userData'].id },
    );
    return ResponseFormatService.responseOk(
      deleteData,
      'Opportunity Type Deleted Successfully',
    );
  }

  async updateExistingOpportunitiesLinkedFields(params: {
    opportunityTypeId: number;
    opportunityTypeFields: Array<{}>;
    oppTypeEntityType: EntityTypeEntity;
    community: number;
  }): Promise<{}> {
    // TODO: handle field visibility experience in updating linkages as well.

    const exisitngIntegratedFields = await this.customFieldIntegrationService.getCustomFieldIntegrations(
      {
        entityObjectId: params.opportunityTypeId,
        entityType: params.oppTypeEntityType,
        community: params.community,
      },
    );

    const opportunities = await this.opportunityService.getOpportunities({
      where: {
        challengeId: null,
        opportunityType: params.opportunityTypeId,
        community: params.community,
      },
    });

    return this.opportunityFieldLinkageService.updateExistingOpportunitiesLinkedFields(
      {
        opportunities,
        updatedFields: params.opportunityTypeFields,
        exisitngIntegratedFields,
        fieldIntegrationType: FieldIntegrationTypeEnum.OPP_TYPE_SUBMISSION_FORM,
      },
    );
  }

  /**
   * Updates all existing opportunities of an opportunity type to type's workflow.
   * @param opportunityType Said challenge.
   * @param originUrl Origin Url of the request (for email and redirection purposes).
   */
  async updateExistingOpportunitiesWorkflow(
    opportunityType: OpportunityTypeEntity,
    originUrl: string,
  ): Promise<void> {
    const stage = await this.stageService.getOneStage({
      where: { workflow: opportunityType.workflowId, isDeleted: false },
      order: { orderNumber: 'ASC' },
      relations: ['workflow', 'status', 'actionItem'],
    });
    const opportunities = (await this.opportunityService.getOpportunities({
      where: { opportunityType: opportunityType.id },
      relations: [
        'challenge',
        'opportunityType',
        'community',
        'stage',
        'stage.actionItem',
        'stage.status',
      ],
    })).filter(
      opportunity =>
        !opportunity.challenge || !opportunity.challenge.workflowId,
    );
    for (const opportunity of opportunities) {
      this.opportunityService.attachStageToOpportunity(
        stage,
        opportunity,
        originUrl,
      );
    }
  }
}

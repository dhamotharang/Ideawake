import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  NotFoundException,
  Logger,
  Put,
} from '@nestjs/common';
import { In, Between } from 'typeorm';
import { OpportunityService } from './opportunity.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  AddOpportunityDto,
  SimilarOpportunitiesDto,
  EditOpportunityDto,
  FilterCountsDto,
  AddOpportunityFieldDataDto,
  IncreaseViewCountOpportunityDto,
  // GetOpportunityDataBodyDto,
  GetOpportunityDataDetailBodyDto,
  GetCurrStageAssigneeForListDto,
  ExportOpportunitiesDto,
  GetOpportunitiesCountDto,
  UpdateOpportunitiesStageDto,
} from './dto';
import { Request } from 'express';
import * as _ from 'lodash';
import { OpportunityAttachmentService } from '../opportunityAttachment/opportunityAttachment.service';
import { BookmarkService } from '../bookmark/bookmark.service';
import { VoteService } from '../vote/vote.service';
import { TagService } from '../tag/tag.service';
import { FollowingContentService } from '../followingContent/followingContent.service';
import {
  TIME_LIMITS,
  ENTITY_TYPES,
  ACTION_ITEM_ABBREVIATIONS,
  CHALLENGE_SORTING,
  ACTION_TYPES,
  PERMISSIONS_MAP,
  OPPORTUNITY_IMPORT_COLUMNS,
  CUSTOM_FIELD_TYPE_ABBREVIATIONS,
  PERMISSIONS_KEYS,
} from '../../common/constants/constants';
import { CommentService } from '../comment/comment.service';
import { OpportunityEntity } from './opportunity.entity';
import { TagEntity } from '../tag/tag.entity';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import {
  VoteType,
  SubscriptionHookEvents,
  RoleLevelEnum,
  PermissionsCondition,
} from '../../enum';
import { MentionService } from '../mention/mention.service';
import { StageAssignmentSettingService } from '../stage/stageAssignmentSettings.service';
import { StageNotificationSettingService } from '../stage/stageNotificationSetting.service';
import { StageAssigneeService } from '../stage/stageAssigneeSettings.service';
import * as moment from 'moment';
import { CustomFieldDataService } from '../customField/customFieldData.service';
import { CustomFieldIntegrationService } from '../customField/customFieldIntegration.service';
import { StageHistoryService } from '../stage/stageHistory.service';
import { StageService } from '../stage/stage.service';
import { EvaluationCriteriaService } from '../evaluationCriteria/evaluationCriteria.service';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { OpportunityEvaluationResponseService } from '../evaluationCriteria/opportunityEvaluationResponse.service';
import { GetAssigneesCountDto } from './dto/GetAssigneesCountDto';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { GetStageNotifiableUsersCountDto } from './dto/GetStageNotifiableUsersCountDto';
import { GetBulkOpportunityPermissionsDto } from './dto/GetBulkOpportunityPermissionsDto';
import { EntityVisibilitySettingService } from '../entityVisibilitySetting/entityVisibilitySetting.service';
import { WorkflowService } from '../workflow/workflow.service';
import { DefaultSort } from '../../enum/default-sort.enum';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { UserService } from '../user/user.service';
import { OpportunityUserService } from '../opportunityUser/opportunityUser.service';
import { OpportunityUserType } from '../../enum/opportunity-user-type.enum';
import { OpportunityTypeService } from '../opportunityType/opportunityType.service';
import { SharedService } from '../../shared/services/shared.services';
import { TriggersHookService } from './../../shared/services/triggersHook.service';
import { CustomFieldService } from '../customField/customField.service';
import { CustomFieldEntity } from '../customField/customField.entity';
import { SearchDuplicatesDto } from './dto/SearchDuplicatesDto';
import { ChallengeService } from '../challenge/challenge.service';
import { OpportunityTypeEntity } from '../opportunityType/opportunityType.entity';
import { ChallengeEntity } from '../challenge/challenge.entity';
import { StageEntity } from '../stage/stage.entity';
import { PermissionsService } from '../../shared/services/permissions.service';
import { OppoBulkUpdateService } from './oppoBulkUpdate.service';
import { EvaluationScoreSyncService } from '../evaluationCriteria/evaluationScoreSync.service';
import { get, groupBy } from 'lodash';
import { UserCircleService } from '../user/userCircle.service';

@Controller('opportunity')
export class OpportunityController {
  private logger = new Logger('Opportunity Controller');
  constructor(
    private readonly opportunityService: OpportunityService,
    private readonly opportunityAttachmentService: OpportunityAttachmentService,
    private readonly bookmarkService: BookmarkService,
    private readonly voteService: VoteService,
    public readonly tagService: TagService,
    public readonly followingContentService: FollowingContentService,
    public readonly commentService: CommentService,
    public readonly mentionService: MentionService,
    public readonly stageAssigneeService: StageAssigneeService,
    public readonly stageNotificationSettingService: StageNotificationSettingService,
    public readonly stageAssignmentSettingService: StageAssignmentSettingService,
    public readonly customFieldService: CustomFieldService,
    public readonly customFieldDataService: CustomFieldDataService,
    public readonly customFieldIntegrationService: CustomFieldIntegrationService,
    public readonly stageHistoryService: StageHistoryService,
    public readonly stageService: StageService,
    public readonly evaluationCriteriaService: EvaluationCriteriaService,
    private readonly opportunityEvaluationResponseService: OpportunityEvaluationResponseService,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
    public readonly entityVisibilitySettingService: EntityVisibilitySettingService,
    public readonly workflowService: WorkflowService,
    public readonly elasticSearchService: ElasticSearchService,
    public readonly userService: UserService,
    public readonly opportunityUserService: OpportunityUserService,
    public readonly opportunityTypeService: OpportunityTypeService,
    public readonly sharedService: SharedService,
    private readonly triggersHookService: TriggersHookService,
    private readonly challengeService: ChallengeService,
    private readonly permissionsService: PermissionsService,
    private readonly evalScoreSyncService: EvaluationScoreSyncService,
    private readonly bulkUpdateService: OppoBulkUpdateService,
    private readonly userCircleService: UserCircleService,
  ) {}

  @Post()
  async addOpportunity(
    @Body() body: AddOpportunityDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      body.user = req['userData'].id;
      req['userData']['community'] = body.community;
      body.isDeleted = false;
      const response = await this.opportunityService.addOpportunity({
        data: body,
        actorData: req['userData'],
      });
      const newAttachmentsData = [];
      if (_.get(body, 'attachments.length')) {
        _.map(
          body.attachments,
          (
            val: {
              url: string;
              attachmentType: string;
              isSelected: number;
              size: number;
              userAttachment: string;
            },
            _key,
          ) => {
            newAttachmentsData.push({
              url: val.url,
              attachmentType: val.attachmentType,
              isSelected: val.isSelected ? 1 : 0,
              opportunity: response.id,
              opportunityType: response.opportunityTypeId,
              isDeleted: false,
              size: val.size,
              userAttachment: val.userAttachment,
            });
          },
        );
        await this.opportunityAttachmentService.addOpportunityAttachment(
          newAttachmentsData,
        );
      }

      const savedOpportunity = await this.opportunityService.getOneOpportunity({
        where: { id: response.id },
        relations: [
          'challenge',
          'opportunityType',
          'community',
          'stage',
          'stage.actionItem',
          'stage.status',
        ],
      });

      const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.IDEA,
      );

      // Selecting default workflow for the opportunity.
      const workflowId =
        (savedOpportunity.challenge && savedOpportunity.challenge.workflowId) ||
        savedOpportunity.opportunityType.workflowId;
      if (workflowId) {
        const firstStage = await this.stageService.getOneStage({
          where: { workflow: workflowId, isDeleted: false },
          order: { orderNumber: 'ASC' },
          relations: ['workflow', 'status', 'actionItem'],
        });

        await this.opportunityService.attachStageToOpportunity(
          firstStage,
          savedOpportunity,
          req.headers.origin as string,
        );

        // Sending automatic workflow addition notification.

        this.opportunityService.sendStageInnobotNotification({
          user: req['userData'],
          opportunity: savedOpportunity,
          stage: firstStage,
          oppoEntityType,
        });
      }
      /**
       * Trigger Hook When New Opportunity Added
       */
      this.triggersHookService.triggerHook({
        output: {
          id: savedOpportunity.id,
          title: savedOpportunity.title,
          description: savedOpportunity.description,
          attachments: _.map(newAttachmentsData, attachment =>
            _.get(attachment, 'url'),
          ).join(),
          date: new Date(savedOpportunity.updatedAt).toDateString(),
          url:
            savedOpportunity.community.url +
            '/idea/view/' +
            savedOpportunity.id,
        },
        community: savedOpportunity.communityId,
        event: SubscriptionHookEvents.NEW_OPPORTUNITY,
        filter: {
          opportunityType: savedOpportunity.opportunityType.id,
          ...(savedOpportunity.challenge && {
            challenge: savedOpportunity.challenge.id,
          }),
        },
      });
      return ResponseFormatService.responseOk(
        response,
        'Opportunity Added Successfully',
      );
    } catch (e) {
      this.logger.error('ERROR In Posting Opportunity: ' + e);
      throw e;
    }
  }

  @Post('import-bulk')
  async importBulkOpportunities(
    @Req() req: Request,
    @Body() body,
  ): Promise<ResponseFormat> {
    const ownersInfo = {};
    const addOpportunityPromiseArr = [];
    let firstStage: any;

    // Fetching existing custom fields that are being used.
    let customFields: CustomFieldEntity[] = [];
    const existingCustomFieldAbbr = Object.getOwnPropertyNames(
      _.head(body),
    ).filter(column => !OPPORTUNITY_IMPORT_COLUMNS.includes(column));
    if (existingCustomFieldAbbr.length) {
      customFields = await this.customFieldService.getCustomFields({
        where: {
          uniqueId: In(existingCustomFieldAbbr),
          community: req['userData'].currentCommunity,
        },
        relations: ['customFieldType'],
      });
    }

    // Creating new custom fields (if any).
    // Currently, new fields are created with multi line text type.
    const newRawFields = _.get(_.head(body), '$custom');
    let newFields: CustomFieldEntity[] = [];
    if (newRawFields) {
      const [textFieldType, defaultEditRoles] = await Promise.all([
        this.customFieldService.getOneCustomFieldType({
          abbreviation: CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_LINE_TEXT,
        }),
        this.customFieldService.getRoleOptions({
          community: req['userData'].currentCommunity,
        }),
      ]);
      const fields = _.map(newRawFields, (_val, fieldTitle) => ({
        title: fieldTitle,
        uniqueId: `${_.snakeCase(fieldTitle)}_${Date.now()}`,
        customFieldType: textFieldType.id,
        visibilityRoles: [],
        visibilityRolesText: 'Public',
        editRoles: defaultEditRoles.map(role => role.id),
        editRolesText: 'Team Members',
        fieldDataObject: { type: 'multi_line_text', data: {} },
        isRequired: false,
        isDeleted: false,
        community: req['userData'].currentCommunity,
      }));

      newFields = await this.customFieldService.addCustomFieldsBulk(fields);
    }

    const opportunityType = await this.opportunityTypeService.getOpportunityType(
      {
        where: {
          id: _.head(body)['opportunityType'],
          community: req['userData'].currentCommunity,
        },
      },
    );
    const workflowId = _.get(opportunityType, 'workflowId');
    if (workflowId) {
      firstStage = await this.stageService.getOneStage({
        where: { workflow: workflowId, isDeleted: false },
        order: { orderNumber: 'ASC' },
        relations: ['workflow', 'status', 'actionItem'],
      });
    }

    // Getting first submitter.
    const firstSubEmails = _.chain(body)
      .map(oppo => _.head(_.compact(_.get(oppo, 'submitters'))))
      .compact()
      .uniq()
      .value();
    let firstSubUsers = [];
    if (firstSubEmails.length) {
      firstSubUsers = await this.userService.getUsersWithFilters({
        emails: firstSubEmails as string[],
        communityId: req['userData'].currentCommunity,
      });
    }
    const firstSubUsersGrouped = _.keyBy(firstSubUsers, 'email');

    const stageIds = [];

    // Parsing opportunities.
    const updateField = [];
    _.forEach(body, (val, key) => {
      const tempObj = {
        title: val['title'],
        description: val['description'],
        opportunityType: _.get(opportunityType, 'id'),
        community: req['userData'].currentCommunity,
        draft: val['draft'] || false,
        anonymous: val['anonymous'] || 0,
        tags: [],
        mentions: [],
        user: _.get(
          firstSubUsersGrouped,
          _.head(_.compact(_.get(val, 'submitters'))),
          req['userData'],
        ).id,
        isDeleted: _.get(val, '_isDeleted', false),
        challenge: _.get(val, '_challenge', null),
        oldPlatformId: _.get(val, 'oldPlatformId', null),
      };

      // Parsing opportinity users (stakeholders).
      ownersInfo[key] = {
        owners: _.compact(_.uniq(_.get(val, 'owners'))),
        submitters: _.compact(_.uniq(_.get(val, 'submitters'))),
        contributors: _.compact(_.uniq(_.get(val, 'contributors'))),
      };

      // Parsing attached stage.
      if (val['stage']) {
        stageIds.push(val['stage']);
      }

      // Creating required custom field data:
      if (customFields.length) {
        const fieldsData = [];
        customFields.forEach(field => {
          if (val[field.uniqueId]) {
            const fieldData = { userId: req['userData'].id };
            if (
              [
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_LINE_TEXT,
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_LINE_TEXT,
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.RICH_TEXT,
              ].includes(field.customFieldType.abbreviation)
            ) {
              fieldData['text'] = val[field.uniqueId];
            } else if (
              field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.NUMBER
            ) {
              fieldData['number'] = parseFloat(
                _.toString(val[field.uniqueId])
                  .replace(/[, ]/gi, '')
                  .trim(),
              );
            } else if (
              field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.DATEPICKER
            ) {
              const selectedDate = moment(val[field.uniqueId], 'MM/DD/YYYY');
              fieldData['date'] = {
                year: selectedDate.year(),
                month: selectedDate.month(),
                day: selectedDate.date(),
              };
            } else if (
              field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_SELECT
            ) {
              const selectedLabel = _.trim(val[field.uniqueId]);
              let selectedValue = _.snakeCase(selectedLabel);
              const selected = _.find(
                _.get(field, 'fieldDataObject.data', []),
                object => {
                  return (
                    _.lowerCase(object.label) === _.lowerCase(selectedLabel)
                  );
                },
              );
              if (!_.isEmpty(selected)) {
                selectedValue = selected.value;
              } else {
                const fieldNewData = [
                  { label: selectedLabel, value: selectedValue, order: 1 },
                ];
                if (_.get(updateField, field.id)) {
                  updateField[field.id].data = [
                    ...updateField[field.id].data,
                    ...fieldNewData,
                  ];
                } else {
                  updateField[field.id] = {
                    id: field.id,
                    fieldDataObject: _.get(field, 'fieldDataObject'),
                    data: fieldNewData,
                  };
                }
              }
              fieldData['selected'] = selectedValue;
            } else if (
              field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_SELECT
            ) {
              let selectedLabels = [];
              if (val._isCustomFieldRaw) {
                selectedLabels = _.get(val, field.uniqueId, []);
              } else {
                selectedLabels = _.get(val, field.uniqueId, '').split(',');
                selectedLabels = _.map(selectedLabels, _.trim);
              }
              let existingValues = [];
              const existingValuesLabels = [];
              _.map(_.get(field, 'fieldDataObject.data', []), object => {
                if (
                  _.includes(
                    _.map(selectedLabels, _.lowerCase),
                    _.lowerCase(object.label),
                  )
                ) {
                  existingValues.push(object.value);
                  existingValuesLabels.push(object.label);
                }
              });
              const newLabels = _.difference(
                selectedLabels,
                existingValuesLabels,
              );
              if (!_.isEmpty(newLabels)) {
                existingValues = _.uniq([
                  ...existingValues,
                  ..._.map(newLabels, _.snakeCase),
                ]);
                const fieldNewData = _.map(newLabels, label => {
                  return { value: _.snakeCase(label), label: label, order: 1 };
                });
                if (_.get(updateField, field.id)) {
                  updateField[field.id].data = [
                    ...updateField[field.id].data,
                    ...fieldNewData,
                  ];
                } else {
                  updateField[field.id] = {
                    id: field.id,
                    fieldDataObject: _.get(field, 'fieldDataObject'),
                    data: fieldNewData,
                  };
                }
              }
              fieldData['selected'] = existingValues;
            } else if (
              [
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.FILE_UPLOAD,
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.VIDEO_UPLOAD,
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.IMAGE_UPLOAD,
              ].includes(field.customFieldType.abbreviation)
            ) {
              fieldData['file'] = val[field.uniqueId];
            }

            fieldsData.push({
              field: field.id,
              fieldData,
              community: req['userData'].currentCommunity,
            });
          }
        });

        if (fieldsData.length) {
          tempObj['opportunityTypeFieldsData'] = fieldsData;
        }
      }

      // Creating data for newly added fields.
      // Currently, this only works for text based custom fields.
      if (newFields.length) {
        const fieldsData = [];
        newFields.forEach(field => {
          const oppFieldData = _.get(val, `$custom.${field.title}`);
          if (oppFieldData) {
            fieldsData.push({
              field: field.id,
              fieldData: { userId: req['userData'].id, text: oppFieldData },
              community: req['userData'].currentCommunity,
            });
          }
        });

        if (fieldsData.length) {
          tempObj['opportunityTypeFieldsData'] = _.get(
            tempObj,
            'opportunityTypeFieldsData',
            [],
          ).concat(fieldsData);
        }
      }

      addOpportunityPromiseArr.push(
        this.opportunityService.addOpportunity({
          data: tempObj,
          actorData: _.get(
            firstSubUsersGrouped,
            _.head(val['submitters']),
            req['userData'],
          ),
          ignoreSubmitter: _.get(
            firstSubUsersGrouped,
            _.head(_.compact(_.get(val, 'submitters'))),
          )
            ? true
            : false,
          ignoreNotifications: true,
        }),
      );
    });
    const updateCustomField = [];
    _.forEach(updateField, customValue => {
      if (!_.isEmpty(customValue)) {
        _.set(
          customValue,
          'fieldDataObject.data',
          _.uniqBy(
            [...customValue.fieldDataObject.data, ...customValue.data],
            'value',
          ),
        );
        updateCustomField.push(
          this.customFieldService.updateCustomField(
            { id: customValue.id },
            { fieldDataObject: customValue.fieldDataObject },
          ),
        );
      }
    });
    await Promise.all(updateCustomField);
    const addedOpportunities = await Promise.all(addOpportunityPromiseArr);

    // Getting saved opportunities.
    const savedOpportunities = await this.opportunityService.getSimpleOpportunities(
      {
        where: { id: In(addedOpportunities.map(opp => opp.id)) },
        relations: ['opportunityType', 'community'],
      },
    );
    const savedOpportunitiesGrouped = _.keyBy(savedOpportunities, 'id');

    const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const allUsers = await this.userService.getUsersWithFilters({
      communityId: req['userData'].currentCommunity,
    });
    const groupedUsers = _.keyBy(allUsers, 'email');

    // Fetching stages that need to be attached.
    const uniqueStageIds = _.uniq(stageIds);
    let stages: StageEntity[] = [];
    if (uniqueStageIds.length) {
      stages = await this.stageService.getStages({
        where: { id: In(uniqueStageIds) },
        relations: ['workflow', 'status', 'actionItem'],
      });

      // Fetching stages' assignees, notification & other settings.
      const stagesSettings = await this.stageService.getRawStagesSettings(
        stages.map(stage => stage.id),
      );
      const stagesSettingsGrouped = _.keyBy(stagesSettings, 'stageId');
      stages = stages.map(stage => ({
        ...stage,
        ..._.get(stagesSettingsGrouped, stage.id, {}),
      }));
    }
    const stagesGrouped = _.keyBy(stages, 'id');

    const attachmentsData = [];
    const opportunityUserAddPromise = [];
    const opportunityStageAddPromise = [];
    const votesAddPromise = [];
    let commentsAddPromises = [];

    _.forEach(addedOpportunities, (opportunity, oppoKey) => {
      const oppoVal = savedOpportunitiesGrouped[opportunity.id];

      if (
        _.get(body, `${oppoKey}.stage`) &&
        _.get(stagesGrouped, body[oppoKey]['stage'])
      ) {
        opportunityStageAddPromise.push(
          this.opportunityService.attachStageToOpportunity(
            _.get(stagesGrouped, body[oppoKey]['stage']),
            oppoVal,
            req.headers.origin as string,
            false,
            !oppoVal.isDeleted, // Generate action item for unarchived oppos only.
          ),
        );
        this.opportunityService.sendStageInnobotNotification({
          user: req['userData'],
          opportunity: oppoVal,
          stage: _.get(stagesGrouped, body[oppoKey]['stage']),
          oppoEntityType,
          onlyActivity: true,
        });
      } else if (!_.isEmpty(firstStage)) {
        opportunityStageAddPromise.push(
          this.opportunityService.attachStageToOpportunity(
            firstStage,
            oppoVal,
            req.headers.origin as string,
            false,
            !oppoVal.isDeleted, // Generate action item for unarchived oppos only.
          ),
        );
        this.opportunityService.sendStageInnobotNotification({
          user: req['userData'],
          opportunity: oppoVal,
          stage: firstStage,
          oppoEntityType,
          onlyActivity: true,
        });
      }
      _.forEach(ownersInfo[oppoKey]['owners'], val => {
        if (groupedUsers[val]) {
          opportunityUserAddPromise.push(
            this.opportunityUserService.addOpportunityUserWithSetting(
              [
                {
                  user: _.get(groupedUsers[val], 'id'),
                  opportunity: oppoVal.id,
                  community: req['userData'].currentCommunity,
                  message: '',
                  opportunityUserType: OpportunityUserType.OWNER,
                },
              ],
              req['userData'],
              false,
            ),
          );
        }
      });
      _.forEach(ownersInfo[oppoKey]['submitters'], val => {
        if (groupedUsers[val]) {
          opportunityUserAddPromise.push(
            this.opportunityUserService.addOpportunityUserWithSetting(
              [
                {
                  user: _.get(groupedUsers[val], 'id'),
                  opportunity: oppoVal.id,
                  community: req['userData'].currentCommunity,
                  message: '',
                  opportunityUserType: OpportunityUserType.SUBMITTER,
                },
              ],
              req['userData'],
              false,
            ),
          );
        }
      });
      _.forEach(ownersInfo[oppoKey]['contributors'], val => {
        if (groupedUsers[val]) {
          opportunityUserAddPromise.push(
            this.opportunityUserService.addOpportunityUserWithSetting(
              [
                {
                  user: _.get(groupedUsers[val], 'id'),
                  opportunity: oppoVal.id,
                  community: req['userData'].currentCommunity,
                  message: '',
                  opportunityUserType: OpportunityUserType.CONTRIBUTOR,
                },
              ],
              req['userData'],
              false,
            ),
          );
        }
      });

      // Parsing attachments data.
      if (_.get(body, `${oppoKey}._attachments.length`)) {
        body[oppoKey]['_attachments'].forEach(attachment => {
          attachmentsData.push({
            url: _.get(attachment, 'url', ''),
            attachmentType: _.get(attachment, 'attachmentType', 'file'),
            opportunityId: oppoVal.id,
            opportunityTypeId: oppoVal.opportunityTypeId,
            size: _.get(attachment, 'size', 0),
            userId: _.get(
              groupedUsers,
              _.get(attachment, 'user'),
              req['userData'],
            ).id,
            communityId: req['userData'].currentCommunity,
          });
        });
      }

      // Adding opportunity votes.
      if (_.get(body, `${oppoKey}._votes.length`)) {
        const votes = _.get(body, `${oppoKey}._votes`).map(vote => ({
          user: _.get(groupedUsers, _.get(vote, 'user'), req['userData']).id,
          voteType: _.get(vote, 'voteType', VoteType.UPVOTE),
          entityObjectId: oppoVal.id,
          entityType: oppoEntityType.id,
          community: req['userData'].currentCommunity,
        }));
        votesAddPromise.push(this.voteService.addSimpleVotes(votes));
      }

      // Adding opportunity comments.
      if (_.get(body, `${oppoKey}._comments.length`)) {
        commentsAddPromises = _.get(body, `${oppoKey}._comments`).map(comment =>
          this.commentService.addCommentWithReplies({
            comment: {
              user: _.get(
                groupedUsers,
                _.get(comment, 'user'),
                req['userData'],
              ),
              message: _.get(comment, 'message', ' '),
              tags: _.get(comment, 'tags', []),
              mentions: _.get(comment, 'mentions', []),
              anonymous: _.get(comment, 'anonymous', 0),
              isDeleted: _.get(comment, 'isDeleted', false),
              entityObjectId: oppoVal.id,
              entityType: oppoEntityType.id,
              community: req['userData'].currentCommunity,
              attachments: _.get(comment, 'attachments', []).map(
                attachment => ({
                  url: _.get(attachment, 'url', ''),
                  attachmentType: _.get(attachment, 'attachmentType', 'file'),
                  size: _.get(attachment, 'size', 0),
                  userId: _.get(
                    groupedUsers,
                    _.get(comment, 'user'),
                    req['userData'],
                  ).id,
                  communityId: req['userData'].currentCommunity,
                  isDeleted: false,
                }),
              ),
            },
            replies: _.get(comment, 'replies', []).map(reply => ({
              user: _.get(groupedUsers, _.get(reply, 'user'), req['userData']),
              message: _.get(reply, 'message', ' '),
              tags: _.get(reply, 'tags', []),
              mentions: _.get(reply, 'mentions', []),
              anonymous: _.get(reply, 'anonymous', 0),
              isDeleted: _.get(reply, 'isDeleted', false),
              entityObjectId: oppoVal.id,
              entityType: oppoEntityType.id,
              community: req['userData'].currentCommunity,
              attachments: _.get(reply, 'attachments', []).map(attachment => ({
                url: _.get(attachment, 'url', ''),
                attachmentType: _.get(attachment, 'attachmentType', 'file'),
                size: _.get(attachment, 'size', 0),
                userId: _.get(
                  groupedUsers,
                  _.get(reply, 'user'),
                  req['userData'],
                ).id,
                communityId: req['userData'].currentCommunity,
                isDeleted: false,
              })),
            })),
          }),
        );
      }
    });

    await Promise.all(opportunityUserAddPromise);
    await Promise.all(votesAddPromise);
    await Promise.all(commentsAddPromises);

    this.opportunityAttachmentService.addOpportunityUserAttachments(
      attachmentsData,
    );

    return ResponseFormatService.responseOk(
      addedOpportunities,
      'Opportunity Added Successfully',
    );
  }

  @Get()
  async getAllOpportunities(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat | false> {
    const options = {
      relations: [],
      where: {},
      order: {},
      take: '',
      skip: '',
    };
    options.take = queryParams.take || 10;
    options.skip = queryParams.skip || 0;
    let filteredIds: any[];
    if (
      queryParams.bookmarkedByMe ||
      queryParams.followedByMe ||
      queryParams.votedFor ||
      queryParams.postedByMe
    ) {
      filteredIds = await this.opportunityService.getOpportunityFilteredData({
        challenge: queryParams.challenge,
        community: queryParams.community,
        bookmarkedByMe: queryParams.bookmarkedByMe,
        followedByMe: queryParams.followedByMe,
        votedFor: queryParams.votedFor,
        postedByMe: queryParams.postedByMe,
        userData: req['userData'],
      });
      if (filteredIds.length && queryParams.id) {
        queryParams.id = [...queryParams.id, ...filteredIds];
      } else if (filteredIds.length) {
        queryParams.id = filteredIds;
      } else {
        queryParams.id = [null];
      }
    }

    if (_.get(queryParams, 'id') && typeof queryParams.id === 'object') {
      queryParams.id = In(queryParams.id);
    }
    if (
      _.get(queryParams, 'opportunityTypes') &&
      typeof queryParams.opportunityTypes === 'object'
    ) {
      queryParams.opportunityType = In(queryParams.opportunityTypes);
    }

    if (queryParams.workflow == -1) {
      queryParams.workflow = null;
    }

    let filterStatuses: [] = [];
    if (
      _.get(queryParams, 'statuses') &&
      typeof queryParams.statuses === 'object'
    ) {
      filterStatuses = queryParams.statuses.map(status => parseInt(status));
      delete queryParams.statuses;
    }
    let filterTags: [] = [];
    if (_.get(queryParams, 'tags') && typeof queryParams.tags === 'object') {
      filterTags = queryParams.tags.map(tag => parseInt(tag));
      delete queryParams.tags;
    }

    options.where = {
      ...queryParams,
      draft: false,
      community: req['userData'].currentCommunity,
    };

    /* Date Filters */
    let dateFilter = {};
    const groupedAllFollowersFinal = {};

    if (queryParams.fromDate || queryParams.toDate) {
      if (queryParams.fromDate && queryParams.toDate) {
        dateFilter = {
          createdAt: Between(
            queryParams.fromDate + ` ${TIME_LIMITS.START}`,
            queryParams.toDate + ` ${TIME_LIMITS.END}`,
          ),
        };
      } else {
        dateFilter = {
          createdAt: Between(
            queryParams.fromDate
              ? queryParams.fromDate + ` ${TIME_LIMITS.START}`
              : queryParams.toDate + ` ${TIME_LIMITS.START}`,
            queryParams.fromDate
              ? queryParams.fromDate + ` ${TIME_LIMITS.END}`
              : queryParams.toDate + ` ${TIME_LIMITS.END}`,
          ),
        };
      }
    }

    const sortClause = {};
    if (
      queryParams.sortBy &&
      queryParams.sortType &&
      ['createdAt', 'currStageScore', 'totalScore'].includes(queryParams.sortBy)
    ) {
      sortClause[`opportunity.${queryParams.sortBy}`] = queryParams.sortType;
      options.order = {
        ...sortClause,
      };
    } else {
      if (queryParams.challenge && !queryParams.sortBy) {
        // Finding followed challenges
        const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
          ENTITY_TYPES.CHALLENGE,
        );
        const experienceSettings = await this.entityExperienceSettingService.getEntityExperienceSetting(
          {
            where: {
              entityType: challengeEntityType.id,
              entityObjectId: queryParams.challenge,
              community: queryParams.community,
            },
          },
        );
        if (
          CHALLENGE_SORTING[experienceSettings.defaultSort] &&
          CHALLENGE_SORTING[experienceSettings.defaultSort].key
        ) {
          queryParams.sortBy =
            CHALLENGE_SORTING[experienceSettings.defaultSort].key;
          queryParams.sortType =
            CHALLENGE_SORTING[experienceSettings.defaultSort].type;

          if (
            experienceSettings.defaultSort === DefaultSort.NEWEST ||
            experienceSettings.defaultSort === DefaultSort.OLDEST
          ) {
            options.order = {
              ...sortClause,
              [queryParams.sortBy]: queryParams.sortType,
            };
          }
        } else {
          options.order = { ...sortClause, ['opportunity.id']: 'DESC' };
        }
      } else if (queryParams.sortBy !== 'random') {
        sortClause['opportunity.createdAt'] = 'DESC';
        options.order = {
          ...sortClause,
        };
      }
    }
    options.where = { ...options.where, ...dateFilter };

    /* Date Filters */

    delete options.where['take'];
    delete options.where['skip'];

    const opportunities = await this.opportunityService.searchOpportunitiesWithCount(
      {
        mainTableWhereFilters: options.where,
        take: parseInt(options.take),
        skip: parseInt(options.skip),
        orderBy: options.order,
        statuses: filterStatuses,
        tags: filterTags,
      },
    );

    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    let resultOpportunities = opportunities[0];
    // Check visibility permissions for opportunities.
    if (opportunities[0].length) {
      const permissions = await this.opportunityService.getOpportunityPermissionsBulk(
        {
          opportunityIds: opportunities[0].map(opp => opp.id),
          userId: req['userData'].id,
          community: req['userData'].currentCommunity,
          includeVisibilitySettings: true,
          includeStageTabPermissions: false,
          includeExpSettings: false,
        },
      );
      const permissionsGrouped = _.groupBy(permissions, 'opportunityId');

      _.forEach(opportunities[0], (valOpp, keyOpp) => {
        if (
          _.head(permissionsGrouped[valOpp.id.toString()]).permissions
            .viewOpportunity === PERMISSIONS_MAP.DENY
        ) {
          delete opportunities[0][keyOpp];
          opportunities[1] = opportunities[1] - 1;
        }
      });
      resultOpportunities = _.compact(opportunities[0]);
    }
    // ---

    let opportunityIds = [];
    let mentionsData;
    if (resultOpportunities.length) {
      opportunityIds = _.map(resultOpportunities, 'id');
    }
    if (opportunityIds.length) {
      const mentionIds = _.flattenDeep(_.map(resultOpportunities, 'mentions'));
      const [
        commentCount,
        voteCount,
        allUpvoters,
        allmentions,
      ] = await Promise.all([
        this.opportunityService.getCommentCount({
          opportunityIds: opportunityIds,
          isDeleted: false,
        }),
        this.opportunityService.getVoteCount(opportunityIds),
        this.voteService.getAllVote({
          where: {
            entityObjectId: In(opportunityIds),
            entityType: opportunityEntityType.id,
            voteType: VoteType.UPVOTE,
          },
          relations: ['user', 'user.profileImage'],
          order: {
            id: 'DESC',
          },
        }),
        mentionIds.length
          ? this.mentionService.getMentions({ where: { id: In(mentionIds) } })
          : [],
      ]);
      const commentCountByOppo = _.keyBy(commentCount, 'opportunity_id');
      const voteCountByOppo = _.keyBy(voteCount, 'opportunity_id');
      const allUpvotersGrouped = _.groupBy(allUpvoters, 'entityObjectId');
      mentionsData = _.groupBy(allmentions, 'entityObjectId');

      for (const iterator of resultOpportunities) {
        iterator['comment'] = _.get(
          commentCountByOppo,
          `${iterator.id}.comment`,
          0,
        );
        iterator['vote'] = _.get(voteCountByOppo, `${iterator.id}.vote`, 0);
        iterator['totalUpvoteCount'] = allUpvotersGrouped[iterator.id]
          ? allUpvotersGrouped[iterator.id].length
          : 0;
        iterator['allUpvoters'] = allUpvotersGrouped[iterator.id]
          ? allUpvotersGrouped[iterator.id].map(voter => voter['user'])
          : [];
        iterator['latestUpvoters'] = allUpvotersGrouped[iterator.id]
          ? allUpvotersGrouped[iterator.id]
              .slice(0, 3)
              .map(voter => voter['user'])
          : [];
      }
    }

    if (
      queryParams.sortBy &&
      queryParams.sortType &&
      (queryParams.sortBy === 'comment' || queryParams.sortBy === 'vote')
    ) {
      resultOpportunities = _.orderBy(
        resultOpportunities,
        item => parseInt(_.get(item, queryParams.sortBy) || 0),
        [_.toLower(queryParams.sortType) as 'asc' | 'desc'],
      );
    }

    for (const iterator of resultOpportunities) {
      const bookmarkFind = await this.bookmarkService.getUserBookmarksByEntityObjectId(
        iterator.id,
        req['userData'].id,
      );
      if (!_.isEmpty(bookmarkFind)) {
        iterator['bookmark'] = true;
        iterator['bookmarkId'] = bookmarkFind[0].id;
      } else {
        iterator['bookmark'] = false;
        iterator['bookmarkId'] = '';
      }
      /* Finding Follow boolean */
      const followFind = await this.followingContentService.getUserFollowByEntityObjectId(
        opportunityEntityType.id,
        iterator.id,
        req['userData'].id,
      );
      if (!_.isEmpty(followFind)) {
        iterator['following'] = true;
        iterator['followId'] = followFind[0].id;
      } else {
        iterator['following'] = false;
        iterator['followId'] = '';
      }

      iterator.user['ideaCount'] = _.filter(
        iterator.user.opportunities,
        function(o) {
          return o.draft === false;
        },
      ).length;
      if (iterator.anonymous === 1) {
        iterator.user.firstName = 'Anonymous';
        iterator.user.lastName = '';
        iterator.user.userName = '';
        iterator.user.secondaryEmail = '';
        iterator.user.email = '';
        iterator.user.id = null;
      }
      delete iterator.user.opportunities;
    }
    const upvoteCountObject = {};
    const upvoteDataObject = {};
    let commentCounts = {};
    let ideaRleatedUserFollowingData;

    if (resultOpportunities.length) {
      const counts = await this.voteService.getTypeVoteCount(
        opportunityIds,
        ENTITY_TYPES.IDEA,
      );

      const groupedCounts = _.groupBy(counts, 'entityObjectId');
      const voteUsers = _.map(counts, 'user.id');

      for (const iterator in groupedCounts) {
        upvoteCountObject[iterator] = groupedCounts[iterator].length;
        upvoteDataObject[iterator] = groupedCounts[iterator];
      }
      let allFollowers;
      if (opportunityIds.length) {
        allFollowers = await this.followingContentService.getFollowByEntityByEntityObjectId(
          opportunityIds,
          opportunityEntityType.id,
        );
        let followerUsers = [];

        for (const iterator in allFollowers) {
          groupedAllFollowersFinal[allFollowers[iterator]['entityObjectId']] =
            allFollowers[iterator]['userFollowingContents'];
          followerUsers = [
            ...followerUsers,
            ..._.map(
              allFollowers[iterator]['userFollowingContents'],
              'user.id',
            ),
          ];
        }

        const allFollowUpvoteUsers = _.flatMap(
          _.merge(voteUsers, followerUsers),
        );
        if (allFollowUpvoteUsers.length) {
          const ideaUpvoterAndFollowersFollowing = await this.followingContentService.getUserFollowByEntityObjectIds(
            allFollowUpvoteUsers,
            req['userData'].id,
            opportunityEntityType.id,
          );
          ideaRleatedUserFollowingData = _.groupBy(
            ideaUpvoterAndFollowersFollowing,
            'entityObjectId',
          );
        }
      }

      const comments = await this.commentService.getComments({
        where: {
          entityObjectId: In(opportunityIds),
        },
      });
      commentCounts = _.countBy(comments, 'entityObjectId');
    }

    const tagsData = {};
    if (resultOpportunities.length) {
      const tagsDictionary = _.filter(
        _.uniq(_.flatMap(_.map(opportunities[0], 'tags'))),
        function(o) {
          // return validate(o);
          return o;
        },
      );
      if (tagsDictionary.length) {
        const tempTagsData = await this.tagService.getTags({
          where: { id: In(tagsDictionary) },
        });
        if (tempTagsData.length) {
          _.map(tempTagsData, (val, _key) => {
            tagsData[val.id] = val.name;
          });
        }
      }
    }
    return ResponseFormatService.responseOk(
      {
        data: resultOpportunities,
        count: opportunities[1],
        upvotes: upvoteCountObject,
        upvoteData: upvoteDataObject,
        tagsData: tagsData,
        followersData: groupedAllFollowersFinal,
        ideaRleatedUserFollowingData: ideaRleatedUserFollowingData,
        commentCounts: commentCounts,
        mentionsData: mentionsData || [],
      },
      'All',
    );
  }

  @Post('search-duplicates')
  async searchDuplciateOpportunities(
    @Body() body: SearchDuplicatesDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Check the opportunity and challenge types settings for duplicate detection.
    let enableDupDetection = false;
    let challengeOnlyDups = false;
    let duplicatableTypes = [];
    let challenge: ChallengeEntity;
    let opportunityType: OpportunityTypeEntity;

    // If challenge is given, check challenge's duplicate submissions settings.
    if (body.challenge) {
      challenge = await this.challengeService.getOneChallenge({
        where: {
          id: body.challenge,
          community: req['userData'].currentCommunity,
          isDeleted: false,
        },
      });
      enableDupDetection = _.get(challenge, 'enableDupDetection', false);
      challengeOnlyDups = _.get(challenge, 'challengeOnlyDuplicates', false);
    }

    // Check opportunity type's duplicate settings if either no challenge is
    // given or the challenge settings have All Submissions enabled (i.e.
    // challengeOnlyDuplicates being false).
    if (
      (body.challenge && enableDupDetection && !challengeOnlyDups) ||
      (!body.challenge && body.opportunityType)
    ) {
      opportunityType = await this.opportunityTypeService.getOpportunityType({
        where: {
          id: body.challenge
            ? _.get(challenge, 'opportunityTypeId')
            : body.opportunityType,
          community: req['userData'].currentCommunity,
          isDeleted: false,
        },
      });
      enableDupDetection = _.get(opportunityType, 'enableDupDetection', false);
      duplicatableTypes = _.get(opportunityType, 'duplicatableTypes') || [];

      // Add in current opportunity type in duplicatableTypes (if not already present).
      if (
        enableDupDetection &&
        !duplicatableTypes.includes(opportunityType.id)
      ) {
        duplicatableTypes.push(opportunityType.id);
      }
    }

    // Find duplicates if duplication is enabled.
    let dupOpportunities = { opportunities: [], total: 0 };

    if (enableDupDetection && (body.title || body.description)) {
      dupOpportunities = await this.opportunityService.searchDuplciateOpportunities(
        {
          title: body.title,
          description: body.description,
          ...(challengeOnlyDups && { challenge: challenge.id }),
          ...(duplicatableTypes.length && {
            opportunityTypes: duplicatableTypes,
          }),
          userId: req['userData'].id,
          community: req['userData'].currentCommunity,
        },
      );
    }

    return ResponseFormatService.responseOk(dupOpportunities, 'All Duplicates');
  }

  @Get('permissions')
  async getOpportunityPermissions(
    @Query('id') id,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const permissions = await this.opportunityService.getOpportunityPermissions(
      id,
      req['userData'].id,
    );
    return ResponseFormatService.responseOk(permissions, 'All');
  }

  @Post('bulk-permissions')
  async getBulkOpportunityPermissions(
    @Body() body: GetBulkOpportunityPermissionsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const permissions = await this.opportunityService.getOpportunityPermissionsBulk(
      {
        opportunityIds: body.opportunities,
        userId: req['userData'].id,
        community: req['userData'].currentCommunity,
        includeExpSettings: body.hasOwnProperty('computeExpSettings')
          ? body.computeExpSettings
          : true,
        includeVisibilitySettings: body.computeVisibilitySettings || false,
        includeStageTabPermissions: body.computeStageTabPermissions || false,
      },
    );
    return ResponseFormatService.responseOk(permissions, 'All Permissions');
  }

  @Post('bulk-visibility-settings')
  async getBulkVisbilitySettings(
    @Body() body: GetBulkOpportunityPermissionsDto,
  ): Promise<ResponseFormat> {
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const entityVisibilitySettings = await this.entityVisibilitySettingService.getEntityVisibilitySettings(
      {
        where: {
          entityObjectId: In(body.opportunities),
          entityType: oppEntityType,
        },
      },
    );
    return ResponseFormatService.responseOk(
      entityVisibilitySettings,
      'All visibility settings.',
    );
  }

  @Get('current-stage-assignees/:id')
  async getCurrentStageAssignee(
    @Param('id') id,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const assignees = await this.opportunityService.getCurrentStageAssignees(
      id,
      undefined,
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(assignees, 'All');
  }

  @Post('current-stage-assignees')
  async getOppStageAssigneesInBulk(
    @Body()
    body: {
      opportunityIds: [];
    },
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const currentAssigneePromise = [];
    _.map(body.opportunityIds, res => {
      currentAssigneePromise.push(
        this.opportunityService.getCurrentStageAssignees(
          res,
          true,
          req['userData'].currentCommunity,
        ),
      );
    });
    let assigneesData = await Promise.all(currentAssigneePromise);
    assigneesData = _.flatten(_.compact(assigneesData));

    return ResponseFormatService.responseOk(assigneesData, 'All');
  }

  /**
   * Get current stage assignee settings for opportunities list.
   * @param body Filters to search opportunities for.
   * @param req Incomming request object.
   */
  @Post('curr-stage-assignees-for-list')
  async getCurrStageAssigneeForList(
    @Body() body: GetCurrStageAssigneeForListDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const assigneesData = await this.opportunityService.getCurrStageAssigneeForList(
      {
        opportunityIds: body.opportunityIds,
        communityId: req['userData'].currentCommunity,
      },
    );

    return ResponseFormatService.responseOk(assigneesData, 'All');
  }

  @Post('assignees-count')
  async getAssigneesCount(
    @Body() body: GetAssigneesCountDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const assignees = await this.opportunityService.getAssigneesFromSettings(
      body.opportunity,
      body.assigneeSettings,
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(
      { count: assignees.length },
      'Assignees Count',
    );
  }

  @Post('get-opportunity-data')
  async getAllOpportunitiesNew(
    // @Body() body: GetOpportunityDataBodyDto,
    @Body() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const responseData = await this.sharedService.getAllOpportunities(
      {
        ...queryParams,
        draft: false,
        community: req['userData'].currentCommunity,
      },
      req,
    );

    return ResponseFormatService.responseOk(responseData, 'All Opportunities');
  }

  @Post('get-opportunity-details')
  async getOpportunitiesDetailsNew(
    @Body() body: GetOpportunityDataDetailBodyDto,
    @Query() queryParams,
  ): Promise<ResponseFormat> {
    const whereParams = {};
    if (body.opportunityIds.length) {
      whereParams['id'] = In(body.opportunityIds);
    }
    whereParams['community'] = body.community;
    let updatedParams = {};
    _.map(queryParams, (val, key) => {
      updatedParams = { ...updatedParams, ...{ [key]: parseInt(val) } };
    });
    const opportunities = await this.opportunityService.searchOpportunitiesDetailsOptimize(
      { ...updatedParams, whereClause: whereParams },
    );
    const tagsData = {};

    const [opportunityEntityType, stageEntityType] = await Promise.all([
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.IDEA),
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
    ]);

    // Getting Tags Data
    if (updatedParams['tags'] && opportunities.length) {
      const tagsDictionary = _.filter(
        _.uniq(_.flatMap(_.map(opportunities, 'tags'))),
        function(o) {
          // return validate(o);
          return o;
        },
      );
      if (tagsDictionary.length) {
        const tempTagsData = await this.tagService.getTags({
          where: { id: In(tagsDictionary) },
        });
        if (tempTagsData.length) {
          _.map(tempTagsData, (val, _key) => {
            tagsData[val.id] = val.name;
          });
        }
      }
    }
    const upvoteCountObject = {};
    const upvoteDataObject = {};
    let commentCounts = {};
    const groupedAllFollowersFinal = {};
    let mentionsData;
    let stageAssignmentSettings;
    const criteriaResponses = [];

    let customFieldsData;
    let submitterGroups;
    // Getting Upvote Count
    if (updatedParams['upvoteCount']) {
      const counts = await this.voteService.getTypeVoteCount(
        body.opportunityIds,
        ENTITY_TYPES.IDEA,
      );
      const groupedCounts = _.groupBy(counts, 'entityObjectId');

      for (const iterator in groupedCounts) {
        upvoteCountObject[iterator] = groupedCounts[iterator].length;
      }
    }
    // Getting Upvote Data
    if (updatedParams['upvoteData']) {
      const counts = await this.voteService.getTypeVoteCount(
        body.opportunityIds,
        ENTITY_TYPES.IDEA,
      );
      const groupedCounts = _.groupBy(counts, 'entityObjectId');

      for (const iterator in groupedCounts) {
        upvoteDataObject[iterator] = groupedCounts[iterator];
      }
    }
    // Getting Comment Count
    if (updatedParams['commentCount']) {
      const comments = await this.commentService.getComments({
        where: {
          entityObjectId: In(body.opportunityIds),
        },
      });
      commentCounts = _.countBy(comments, 'entityObjectId');
    }
    // Getting Followers Data
    if (updatedParams['followersData']) {
      const allFollowers = await this.followingContentService.getFollowByEntityByEntityObjectId(
        body.opportunityIds,
        opportunityEntityType.id,
      );
      let followerUsers = [];

      for (const iterator in allFollowers) {
        groupedAllFollowersFinal[allFollowers[iterator]['entityObjectId']] =
          allFollowers[iterator]['userFollowingContents'];
        followerUsers = [
          ...followerUsers,
          ..._.map(allFollowers[iterator]['userFollowingContents'], 'user.id'),
        ];
      }
    }
    // Getting Mentions
    if (updatedParams['mentions']) {
      const mentionIds = _.flattenDeep(_.map(opportunities, 'mentions'));
      if (mentionIds.length) {
        const allMentions = await this.mentionService.getMentions({
          where: { id: In(mentionIds) },
        });
        mentionsData = _.groupBy(allMentions, 'entityObjectId');
      }
    }

    // Getting Stage Settings
    if (updatedParams['stageAssignmentSettings']) {
      const assSettings = await this.stageAssignmentSettingService.getStageAssignmentSettings(
        {
          entityObjectId: In(body.opportunityIds),
          entityType: opportunityEntityType,
        },
      );
      stageAssignmentSettings = _.groupBy(assSettings, 'entityObjectId');
      stageAssignmentSettings = _.forEach(
        stageAssignmentSettings,
        (val, key) => {
          stageAssignmentSettings[key] = _.head(val);
        },
      );
    }

    // Getting Criteria Responses
    if (
      updatedParams['criteriaResponses'] &&
      _.get(body.criteriaIds, 'length')
    ) {
      const [criteria, stageCriteriaResp] = await Promise.all([
        this.evaluationCriteriaService.getEvaluationCriterias({
          where: {
            community: body.community,
            id: In(body.criteriaIds),
          },
          relations: ['evaluationType'],
        }),
        this.opportunityEvaluationResponseService.getBulkCriteriaResponses({
          opportunityIds: body.opportunityIds,
          communityId: body.community,
          entityTypeId: stageEntityType.id,
          criteriaIds: body.criteriaIds,
        }),
      ]);
      const criteriaById = _.keyBy(criteria, 'id');
      stageCriteriaResp.forEach(resp => {
        resp.evaluationCriteria = criteriaById[resp.evaluationCriteriaId];
      });
      const criteriaRespByOppo = _.groupBy(stageCriteriaResp, 'opportunityId');

      _.map(criteriaRespByOppo, (_res, key) => {
        const oppoCriteriaResp = _.get(criteriaRespByOppo, key, []);
        if (_.get(oppoCriteriaResp, 'length')) {
          const oppoScores = this.opportunityEvaluationResponseService.getCriteriaResponseScores(
            oppoCriteriaResp,
          );
          _.forEach(oppoScores, score => {
            criteriaResponses.push({
              opportunityId: key,
              evaluationCriteriaId: score.criteria.id,
              score: score,
            });
          });
        }
      });
    }

    if (
      updatedParams['customFieldData'] &&
      _.get(body.customFieldIds, 'length')
    ) {
      const fieldData = await this.customFieldDataService.getCustomFieldData({
        opportunity: In(body.opportunityIds),
        community: body.community,
        field: In(body.customFieldIds),
      });
      customFieldsData = _.groupBy(fieldData, 'opportunityId');
    }

    if (updatedParams['submitterGroups']) {
      const submitterIds = _.map(opportunities, 'userId');
      const submittersGroups = await this.userCircleService.getCommunityUserCircles(
        {
          communityId: body.community,
          userIds: submitterIds,
          isCircleDeleted: false,
        },
      );
      const groupsBySubs = _.groupBy(submittersGroups, 'userId');
      submitterGroups = groupsBySubs;
    }

    return ResponseFormatService.responseOk(
      {
        data: opportunities,
        tagsData: tagsData,
        commentCounts: commentCounts,
        followersData: groupedAllFollowersFinal,
        mentionsData: mentionsData || [],
        upvoteData: upvoteDataObject,
        upvotes: upvoteCountObject,
        ...(stageAssignmentSettings && { stageAssignmentSettings }),
        criteriaResponses,
        ...(customFieldsData && { customFieldsData }),
        submitterGroups,
      },
      'All Opportunities Details',
    );
  }

  @Post('export')
  async exportOpportunities(
    @Body() body: ExportOpportunitiesDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Checking export permissions.
    await this.permissionsService.verifyPermissions(
      _.get(body.opportunityFilters, 'challenge')
        ? RoleLevelEnum.challenge
        : RoleLevelEnum.community,
      _.get(body.opportunityFilters, 'challenge')
        ? parseInt(body.opportunityFilters['challenge'])
        : req['userData'].currentCommunity,
      req['userData'].id,
      [PERMISSIONS_KEYS.exportOpportunity],
      PermissionsCondition.AND,
    );

    // Export opportunities.
    const opportunities = await this.sharedService.getAllOpportunities(
      {
        ...body.opportunityFilters,
        draft: false,
        community: req['userData'].currentCommunity,
      },
      req,
      [
        'workflow',
        'opportunityType',
        'challenge',
        'user',
        'stage',
        'stage.status',
      ],
      true,
      true,
    );

    const exportRes = await this.opportunityService.exportOpportunities(
      opportunities.data,
      body,
      req['userData'].currentCommunity,
    );

    return ResponseFormatService.responseOk(exportRes, 'Exported File Url.');
  }

  @Post('stage-notifiable-users-count')
  async getStageNotfiableUsersCount(
    @Body() body: GetStageNotifiableUsersCountDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const notifiableUsers = await this.opportunityService.getNotifiableUsersFromSettings(
      body.opportunity,
      body.notificationSettings,
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(
      { count: notifiableUsers.length },
      'Notifiable Users Count',
    );
  }

  @Get('opportunity-status')
  /**
   * Get Statuses Counts against Opportunities
   * @param Query
   * @return List Of Statuses With Counts Against Opportunities
   */
  async getOpportunityStatus(
    @Query('community') community,
    @Query('challenge') challenge,
    @Query('user') user,
    @Query('isDeleted') isDeleted,
  ): Promise<ResponseFormat> {
    const opportunityStatus = await this.opportunityService.getOpportunityStatus(
      {
        community: community,
        challenge: challenge,
        user: user,
        isDeleted: isDeleted,
      },
    );
    return ResponseFormatService.responseOk(
      opportunityStatus,
      'All Statsues Count Against Opportunities',
    );
  }

  @Get('filter-counts')
  async getOpportunityFilterCounts(
    @Query()
    queryParams: FilterCountsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    let whereClause = {
      community: queryParams.community,
    };
    if (queryParams.challenge) {
      whereClause = { ...{ challenge: queryParams.challenge }, ...whereClause };
    }
    const challengeOpportunities = await this.opportunityService.getOpportunities(
      {
        where: whereClause,
        relations: ['user'],
      },
    );
    const allOpportunitites = [];
    const postedByMeOpportunities = [];
    const tagsByOpportunity = {};
    let totalUniqueTags = [];
    _.mapKeys(challengeOpportunities, (val: OpportunityEntity) => {
      if (val.tags.length) {
        tagsByOpportunity[val.id] = val.tags;
        totalUniqueTags.push(val.tags);
      }
      allOpportunitites.push(val.id);
      if (val.user.id === req['userData'].id) {
        postedByMeOpportunities.push(val.id);
      }
    });
    totalUniqueTags = _.uniq(_.flatMap(totalUniqueTags));
    const finalTagsData = {};
    if (totalUniqueTags.length) {
      const opportunityAllTags = await this.tagService.getTags({
        where: { id: In(totalUniqueTags) },
      });
      _.mapKeys(opportunityAllTags, (__val: TagEntity) => {
        _.map(tagsByOpportunity, (_val, _key) => {
          if (_.indexOf(_val, __val.id) > -1) {
            if (finalTagsData[__val.name]) {
              finalTagsData[__val.name]['count'] =
                finalTagsData[__val.name]['count'] + 1;
              //   finalTagsData[__val.name]['ids'].push(_key);
              finalTagsData[__val.name]['id'] = __val.id;
            } else {
              finalTagsData[__val.name] = {
                count: 1,
                // ids: [_key]
                id: __val.id,
              };
            }
          }
        });
      });
    }
    let bookmarks;
    let follows;
    let votes;
    let opportunityTypes;
    if (allOpportunitites.length) {
      bookmarks = await this.bookmarkService.getBookmarkCounts(
        queryParams.user || req['userData'].id,
        queryParams.entityType,
        allOpportunitites,
      );
      follows = await this.followingContentService.getFollowingCounts(
        queryParams.user || req['userData'].id,
        queryParams.entityType,
        allOpportunitites,
      );
      votes = await this.voteService.getVoteCounts(
        queryParams.user || req['userData'].id,
        queryParams.entityType,
        allOpportunitites,
      );
      opportunityTypes = await this.opportunityService.getOpportunityCountByType(
        allOpportunitites,
      );
    }

    const finalOpportunityTypes = {};
    if (opportunityTypes) {
      _.map(opportunityTypes, val => {
        finalOpportunityTypes[val.opportunitytype] = {
          //   ids: val.ids,
          id: parseInt(val.opportunitytypeid),
          count: parseInt(val.count),
        };
      });
    }
    const finalResponseObject = {
      bookmarkedByMe: !_.isEmpty(bookmarks) ? bookmarks[0] : {},
      followedByMe: !_.isEmpty(follows) ? follows[0] : {},
      votedFor: !_.isEmpty(votes) ? votes[0] : {},
      postedByMe: postedByMeOpportunities.length
        ? {
            // ids: postedByMeOpportunities,
            count: postedByMeOpportunities.length,
          }
        : {},
      tags: finalTagsData,
      opportunityTypes: finalOpportunityTypes,
    };
    return ResponseFormatService.responseOk(
      finalResponseObject,
      'Filter Counts',
    );
  }

  @Get('count')
  async getOpportunitiesCount(
    @Query() queryParams: GetOpportunitiesCountDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = { relations: [] };
    options.relations = ['opportunityType'];
    const count = await this.opportunityService.getOpportunitiesCount({
      where: { communityId: req['userData'].currentCommunity, ...queryParams },
    });
    return ResponseFormatService.responseOk({ count }, `Opportunities' count.`);
  }

  /**
   * @deprecated in favor of elasticsearch - Use `searchDuplciateOpportunities` API instead.
   */
  @Get('similar-opportunities')
  async getSimilarOpportunities(
    @Query()
    queryParams: SimilarOpportunitiesDto,
  ): Promise<ResponseFormat> {
    const options = { relations: [] };
    options.relations = ['opportunityType'];
    const similarOpportunities = await this.opportunityService.getSimilarOpportunities(
      { title: queryParams.title },
      queryParams.community,
    );
    return ResponseFormatService.responseOk(
      similarOpportunities,
      'Similar Opportunities',
    );
  }

  @Get(':id')
  async getOpportunity(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = { relations: [], where: {} };
    options.relations = [
      'opportunityType',
      'opportunityAttachments',
      'stage',
      'stage.actionItem',
      'stage.status',
      'workflow',
    ];
    options.where = { id: id, community: req['userData'].currentCommunity };
    const opportunity = await this.opportunityService.getOpportunities(options);
    return ResponseFormatService.responseOk(opportunity, 'All');
  }

  @Get(':id/opportunity-field-data')
  async getOpportunityFieldData(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = { relations: [], where: {} };
    options.relations = ['opportunity'];
    options.where = {
      opportunity: id,
      community: req['userData'].currentCommunity,
    };
    const opportunity = await this.customFieldDataService.getCustomFieldData(
      options,
    );
    return ResponseFormatService.responseOk(
      opportunity,
      'Opportunity Field Data',
    );
  }

  @Get(':id/stage-completion-stats')
  async getStageCompletionForOpportunity(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = { relations: ['stage', 'stage.actionItem'], where: {} };
    options.where = { id: id, community: req['userData'].currentCommunity };
    const opportunity = await this.opportunityService.getOneOpportunity(
      options,
    );

    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const dataForOpportunity = await this.stageAssignmentSettingService.getStageAssignmentSettings(
      {
        entityObjectId: id,
        entityType: opportunityEntityType.id,
      },
    );

    let finalData = { total: 0, completed: 0 };

    if (
      opportunity.stage &&
      opportunity.stage.actionItem.abbreviation ===
        ACTION_ITEM_ABBREVIATIONS.REFINEMENT
    ) {
      // Calculating stage completion for Refinement stage.
      const dataForCustomFieldIntegrations = await this.customFieldIntegrationService.getCustomFieldIntegrations(
        {
          entityObjectId: opportunity.stageId,
          entityType: stageEntityType,
          community: opportunity.communityId,
        },
      );
      const fieldIds = _.map(dataForCustomFieldIntegrations, 'fieldId');
      let customFieldData = [];
      if (fieldIds.length) {
        customFieldData = await this.customFieldDataService.getCustomFieldData({
          where: { field: In(fieldIds), opportunity: id },
        });
      }

      const totalAttachedFieldsWithStage =
        dataForCustomFieldIntegrations.length;
      const totalCompletedFieldsOfCurrentOpportunityUnderStage =
        customFieldData.length;

      const totalForCompletion = dataForOpportunity[0].allAssigneesCompleted
        ? totalAttachedFieldsWithStage
        : _.min([
            dataForOpportunity[0].minimumResponses,
            totalAttachedFieldsWithStage,
          ]);
      finalData = {
        total: totalForCompletion,
        completed: _.min([
          totalCompletedFieldsOfCurrentOpportunityUnderStage,
          totalForCompletion,
        ]),
      };
    } else if (
      opportunity.stage &&
      opportunity.stage.actionItem.abbreviation ===
        ACTION_ITEM_ABBREVIATIONS.SCORECARD
    ) {
      const options = {
        where: {
          opportunity: opportunity,
          entityType: stageEntityType,
          entityObjectId: opportunity.stageId,
          community: opportunity.communityId,
        },
      };
      // Calculating stage completion for Scorecard stage.
      const responses = await this.opportunityEvaluationResponseService.getOpportunityEvaluationResponses(
        options,
      );
      const uniqResp = _.uniqBy(responses, 'userId');

      const stageAssignees = await this.opportunityService.getCurrentStageAssignees(
        parseInt(id),
      );

      const responsesCount = uniqResp.length;
      const totalResponses = dataForOpportunity[0].allAssigneesCompleted
        ? stageAssignees.length
        : _.min([
            dataForOpportunity[0].minimumResponses,
            stageAssignees.length,
          ]);

      finalData = {
        completed: _.min([responsesCount, totalResponses]),
        total: totalResponses,
      };
    }

    return ResponseFormatService.responseOk(
      finalData,
      'Opportunity Field Data',
    );
  }

  @Post('stage-completion-stats')
  async getStageCompletionForOpportunities(
    @Body()
    body: {
      opportunityIds: [];
    },
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = { relations: ['stage', 'stage.actionItem'], where: {} };
    options.where = {
      id: In(body.opportunityIds),
      community: req['userData'].currentCommunity,
    };
    const opportunity = await this.opportunityService.getOpportunities(options);

    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    const stageCompletionPromiseArr = [];
    _.map(opportunity, val => {
      stageCompletionPromiseArr.push(
        this.opportunityService.stageCompletionStats({
          opportunityId: val.id,
          communityId: req['userData'].currentCommunity,
          opportunity: val,
          stageEntityType,
          opportunityEntityType,
        }),
      );
    });
    let dataForCompletion = await Promise.all(stageCompletionPromiseArr);
    dataForCompletion = _.compact(dataForCompletion);
    return ResponseFormatService.responseOk(
      dataForCompletion,
      'Opportunity Field Data',
    );
  }

  @Patch('bulk-stage-update')
  async updateOpportunitiesStage(
    @Body() body: UpdateOpportunitiesStageDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const originUrl: string = req.headers.origin as string;
    const response = await this.bulkUpdateService.updateOpportunitiesStage(
      body,
      {
        ...req['userData'],
        community: req['userData'].currentCommunity,
      },
      req['userData'].currentCommunity,
      originUrl,
    );
    return ResponseFormatService.responseOk(
      response,
      'Stage Updated Successfully!',
    );
  }

  @Patch(':id')
  async updateOpportunity(
    @Param('id') id,
    @Body() body: EditOpportunityDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (body.attachments && body.attachments.length > 0) {
      await this.opportunityAttachmentService.deleteOpportunityAttachment({
        opportunity: id,
      });
      const newAttachmentsData = [];
      _.map(
        body.attachments,
        (
          val: {
            url: string;
            attachmentType: string;
            isSelected: number;
            size: number;
            userAttachment: string;
          },
          _key,
        ) => {
          newAttachmentsData.push({
            url: val.url,
            attachmentType: val.attachmentType,
            isSelected: val.isSelected ? 1 : 0,
            opportunity: id,
            opportunityType: body.opportunityType,
            isDeleted: false,
            size: val.size,
            userAttachment: val.userAttachment,
          });
        },
      );
      await this.opportunityAttachmentService.addOpportunityAttachment(
        newAttachmentsData,
      );
    } else if (!body.viewCount && !body.stage) {
      await this.opportunityAttachmentService.deleteOpportunityAttachment({
        opportunity: id,
      });
    }

    const [
      oppoEntityType,
      stageEntityType,
      opportunityDataCurent,
    ] = await Promise.all([
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.IDEA),
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
      this.opportunityService.getOneOpportunity({
        relations: ['stage', 'stage.actionItem', 'community', 'workflow'],
        where: { id: id, communityId: req['userData'].currentCommunity },
      }),
    ]);

    let newStage;
    if (body.stage) {
      if (body.assigneeSettings) {
        body.assigneeSettings = this.opportunityService.checkAssigneeAllMembersUnassingedRequest(
          body.assigneeSettings,
        );
      }
      if (body.stageActivityVisibilitySettings) {
        body.stageActivityVisibilitySettings = this.opportunityService.checkAssigneeAllMembersUnassingedRequest(
          body.stageActivityVisibilitySettings,
        );
      }

      const actorData = {
        ...req['userData'],
        community: opportunityDataCurent.communityId,
      };
      const actionData = {
        ...opportunityDataCurent,
        entityObjectId: opportunityDataCurent.id,
        entityType: oppoEntityType.id,
      };

      if (
        body.stage &&
        opportunityDataCurent.stage &&
        opportunityDataCurent.stage.id &&
        opportunityDataCurent.stage.id === body.stage
      ) {
        await this.opportunityService.editOpportunityStageData(
          body,
          id,
          opportunityDataCurent.community.id,
        );
        if (
          opportunityDataCurent.stage.actionItem.abbreviation ===
          ACTION_ITEM_ABBREVIATIONS.SCORECARD
        ) {
          this.evalScoreSyncService.syncEvalSummary({
            opportunityId: opportunityDataCurent.id,
            entityObjectId: opportunityDataCurent.stageId,
            entityTypeId: stageEntityType.id,
            communityId: req['userData'].currentCommunity,
            syncAssignee: true,
            syncCompletion: true,
          });
        }
      } else {
        const triggerOutput = {};
        newStage = triggerOutput[
          'currentStage'
        ] = await this.stageService.getOneStage({
          where: { id: body.stage },
          relations: ['actionItem', 'status'],
        });

        if (opportunityDataCurent.stage) {
          const stageData = (triggerOutput[
            'oldStage'
          ] = await this.stageService.getOneStage({
            where: { id: opportunityDataCurent.stage.id },
            relations: ['actionItem', 'status'],
          }));

          // Storing final scores if the current stage is a scorecard one.
          let computeObject = {};
          if (
            opportunityDataCurent.stage.actionItem.abbreviation ===
            ACTION_ITEM_ABBREVIATIONS.SCORECARD
          ) {
            computeObject = await this.evaluationCriteriaService.getEvaluationsEntityScores(
              {
                entityObjectId: opportunityDataCurent.stage.id,
                entityType: stageEntityType.id,
                opportunity: opportunityDataCurent.id,
                community: opportunityDataCurent.communityId,
              },
            );

            NotificationHookService.addCriteriaFinalScores({
              criteriaScores: computeObject['criteriaScores'],
              opportunity: opportunityDataCurent.id,
              entityType: stageEntityType.id,
              entityObjectId: opportunityDataCurent.stage.id,
            });
          }

          // Updating existing stage's history.
          NotificationHookService.addStageHistory({
            oldStageData: {
              actionItem: stageData.actionItem,
              stage: opportunityDataCurent.stage,
              status: stageData.status,
              opportunity: opportunityDataCurent,
              computeObject: computeObject,
              enteringAt: moment().format(),
              exitingAt: moment().format(),
              community: opportunityDataCurent.community,
            },
          });

          // Adding new stage in history.
          NotificationHookService.addStageHistory({
            oldStageData: {
              stage: newStage,
              actionItem: newStage.actionItem,
              status: newStage.status,
              opportunity: opportunityDataCurent,
              computeObject: {},
              enteringAt: moment().format(),
              community: opportunityDataCurent.community,
            },
          });

          // Update existing Open action item statuses and sync it's summary.
          await Promise.all([
            this.opportunityService.updateCurrentStageActionItemStatus(
              opportunityDataCurent,
              stageEntityType,
              oppoEntityType,
              req['userData'].currentCommunity,
            ),
            opportunityDataCurent.stage.actionItem.abbreviation ===
            ACTION_ITEM_ABBREVIATIONS.SCORECARD
              ? this.evalScoreSyncService.syncEvalSummary({
                  opportunityId: opportunityDataCurent.id,
                  entityObjectId: opportunityDataCurent.stageId,
                  entityTypeId: stageEntityType.id,
                  communityId: req['userData'].currentCommunity,
                  syncCompletion: true,
                })
              : Promise.resolve(undefined),
          ]);

          if (opportunityDataCurent.workflowId === body.workflow) {
            // Change Stage Notification
            triggerOutput['currentWorkflow'] = opportunityDataCurent.workflow;
            this.opportunityService.generateUpdateStageNotification({
              opportunity: opportunityDataCurent,
              stageNotificationSettings: body.stageNotificationSettings,
              actionData,
              actorData,
              actionType: ACTION_TYPES.CHANGE_STAGE,
              oldStage: stageData,
              newStage,
            });
          } else {
            // Change Workflow Notification
            triggerOutput['oldWorkflow'] = opportunityDataCurent.workflow;
            const newWorkflow = (triggerOutput[
              'currentWorkflow'
            ] = await this.workflowService.getOneWorkflow({
              where: { id: body.workflow },
            }));
            this.opportunityService.generateUpdateStageNotification({
              opportunity: opportunityDataCurent,
              stageNotificationSettings: body.stageNotificationSettings,
              actionData,
              actorData,
              actionType: ACTION_TYPES.CHANGE_WORKFLOW,
              oldStage: stageData,
              newStage,
              oldWorkflow: opportunityDataCurent.workflow,
              newWorkflow,
            });
          }
        } else {
          const computeObject = await this.evaluationCriteriaService.getEvaluationsEntityScores(
            {
              entityObjectId: newStage.id,
              entityType: stageEntityType.id,
              opportunity: opportunityDataCurent.id,
              community: opportunityDataCurent.communityId,
            },
          );
          NotificationHookService.addStageHistory({
            oldStageData: {
              stage: newStage,
              actionItem: newStage.actionItem,
              status: newStage.status,
              opportunity: opportunityDataCurent,
              computeObject: computeObject,
              enteringAt: moment().format(),
              community: opportunityDataCurent.community,
            },
          });

          // Add Workflow Notification
          const newWorkflow = (triggerOutput[
            'currentWorkflow'
          ] = await this.workflowService.getOneWorkflow({
            where: { id: body.workflow },
          }));
          this.opportunityService.generateUpdateStageNotification({
            opportunity: opportunityDataCurent,
            stageNotificationSettings: body.stageNotificationSettings,
            actionData,
            actorData,
            actionType: ACTION_TYPES.ADD_WORKFLOW,
            newStage,
            newWorkflow,
          });
        }
        body['stageAttachmentDate'] = moment().format('YYYY-MM-DD');
        await this.opportunityService.addOpportunityStageData(
          body,
          id,
          opportunityDataCurent.community.id,
        );
        triggerOutput['opportunity'] = opportunityDataCurent;

        /**
         * Trigger Hook When Stage Changes
         */
        this.triggersHookService.triggerHook({
          output: {
            ...(triggerOutput['currentStage'] && {
              currentStage: triggerOutput['currentStage'].title,
            }),
            ...(triggerOutput['oldStage'] && {
              oldStage: triggerOutput['oldStage'].title,
            }),
            ...(triggerOutput['currentWorkflow'] && {
              currentWorkflow: triggerOutput['currentWorkflow'].title,
            }),
            ...(triggerOutput['oldWorkflow'] && {
              oldWorkflow: triggerOutput['oldWorkflow'].title,
            }),
            name: triggerOutput['opportunity'].title,
            id: triggerOutput['opportunity'].id,
            url:
              triggerOutput['opportunity'].community.url +
              '/idea/view/' +
              triggerOutput['opportunity'].id,
          },
          community: req['userData'].currentCommunity,
          event: SubscriptionHookEvents.STAGE_CHANGE,
          filter: {
            ...(triggerOutput['opportunity'].challengeId && {
              challenge: triggerOutput['opportunity'].challengeId,
            }),
            ...(triggerOutput['currentWorkflow'] && {
              workflow: triggerOutput['currentWorkflow'].id,
            }),
            ...(triggerOutput['currentStage'] && {
              stage: triggerOutput['currentStage'].id,
            }),
          },
        });
      }
    }

    delete body.attachments;
    delete body.assigneeSettings;
    // delete body.stageAssignmentSettings;
    delete body.stageNotificationSettings;
    delete body.stageActivityVisibilitySettings;
    const originUrl = req.headers.origin;
    const updateData = await this.opportunityService.updateOpportunity(
      { id: id, communityId: req['userData'].currentCommunity },
      body,
      req['userData'],
      originUrl,
    );

    if (body.stage) {
      // Refresh opportunity scores on stage change.
      this.evalScoreSyncService.syncCurrentStageScore({
        opportunityId: opportunityDataCurent.id,
        communityId: req['userData'].currentCommunity,
      });

      // Sync new stage's evalutation summary
      if (
        newStage &&
        newStage.actionItem.abbreviation === ACTION_ITEM_ABBREVIATIONS.SCORECARD
      ) {
        this.evalScoreSyncService.syncEvalSummary({
          opportunityId: opportunityDataCurent.id,
          entityObjectId: newStage.id,
          entityTypeId: stageEntityType.id,
          communityId: req['userData'].currentCommunity,
          syncAssignee: true,
          syncCompletion: true,
        });
      }
    }

    const options = {
      relations: [],
      where: { id: id },
    };
    if (updateData['affected']) {
      options.relations = [
        'community',
        'user',
        'opportunityType',
        'opportunityAttachments',
        'opportunityAttachments.userAttachment',
        'user.profileImage',
        'user.opportunities',
        'user.opportunities.opportunityType',
      ];
      const opportunity = await this.opportunityService.getOpportunities(
        options,
      );
      if (opportunity[0].anonymous === 1) {
        opportunity[0].user.firstName = 'Anonymous';
        opportunity[0].user.lastName = '';
        opportunity[0].user.userName = '';
        opportunity[0].user.secondaryEmail = '';
        opportunity[0].user.email = '';
        opportunity[0].user.id = null;
      }
      updateData['updatedData'] = opportunity[0];
    }
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Patch('increase-view-count/:id')
  async increaseViewCount(
    @Param('id') id: string,
    @Body() body: IncreaseViewCountOpportunityDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.opportunityService.increaseViewCount(
      { id: id, communityId: req['userData'].currentCommunity },
      body.viewCount || 1,
    );
    return ResponseFormatService.responseOk(
      updateData,
      'View Count Increased Successfully',
    );
  }

  @Patch(':id/opportunity-field-data/:opportunityFieldId')
  async updateOpportunityFieldData(
    @Param('id') id,
    @Param('opportunityFieldId') opportunityFieldId,
    @Body() body: AddOpportunityFieldDataDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const oldDataObjectMain = await this.customFieldDataService.getCustomFieldData(
      {
        where: {
          opportunity: id,
          id: opportunityFieldId,
          community: req['userData'].currentCommunity,
        },
      },
    );
    if (oldDataObjectMain.length) {
      if (oldDataObjectMain[0].history) {
        body['history'] = {
          ...oldDataObjectMain[0].history,
          ...{
            [moment().format()]: oldDataObjectMain[0].fieldData,
          },
        };
      } else {
        body['history'] = {
          [moment().format()]: oldDataObjectMain[0].fieldData,
        };
      }
      const updatedData = await this.customFieldDataService.simpleUpdateCustomFieldData(
        {
          id: opportunityFieldId,
          opportunity: id,
          community: req['userData'].currentCommunity,
        },
        body,
      );
      return ResponseFormatService.responseOk(
        updatedData,
        'Data updated successfully',
      );
    } else {
      throw new NotFoundException();
    }
  }

  @Delete('')
  async removeOpportunity(
    @Body() ids: [],
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteResponse = await this.opportunityService.updateOpportunityBulk(
      { id: In(ids), community: req['userData'].currentCommunity },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(
      deleteResponse,
      'Opportunity Deleted Successfully',
    );
  }

  @Post('bulk-opportunity-settings-count')
  async getBulkOpportunitiesExperinceSettingsCount(@Body() body: {}): Promise<
    ResponseFormat
  > {
    const response = await this.opportunityService.getBulkOpportunitiesExperinceSettingsCount(
      body,
    );
    return ResponseFormatService.responseOk(
      response,
      'Bulk Opportunities Experince Settings Count',
    );
  }

  @Put('bulk-opportunity-settings')
  async bulkUpdateOpportunitySettings(
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.opportunityService.bulkUpdateOpportunitySettings(
      body,
      req['userData'],
    );
    return ResponseFormatService.responseOk(response, 'Updated Successfully');
  }

  @Post('current-previous-stage')
  async getOpportunitiesEvaluationSummary(
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const opportunityIds = body['opportunityIds'];
    if (!get(opportunityIds, 'length'))
      return ResponseFormatService.responseOk(
        [],
        'All Opportunities Current & Previous Stage and Scores.',
      );

    const stageHistories = await this.stageHistoryService.getStageHistory({
      where: {
        opportunity: In(body['opportunityIds']),
        community: req['userData'].currentCommunity,
      },
      order: {
        id: 'DESC',
      },
      relations: ['stage'],
    });

    const groupedOpportunites = groupBy(stageHistories, 'opportunityId');
    const response = [];

    opportunityIds.forEach(id => {
      const opportunityStageHistory = get(groupedOpportunites, id);
      if (opportunityStageHistory) {
        let currentStage = null;
        let daysInCurrentStage = null;
        let previousStage = null;
        let daysInPreviousStage = null;
        const currentStageHistory = opportunityStageHistory[0];
        currentStage = get(currentStageHistory, 'stage');
        daysInCurrentStage = currentStageHistory.exitingAt
          ? moment(currentStageHistory.exitingAt).diff(
              currentStageHistory.enteringAt,
              'days',
              true,
            )
          : moment(moment()).diff(currentStageHistory.enteringAt, 'days', true);
        if (opportunityStageHistory.length > 1) {
          const previousStageHistory = opportunityStageHistory[1];
          previousStage = get(previousStageHistory, 'stage');
          daysInPreviousStage = previousStageHistory.exitingAt
            ? moment(previousStageHistory.exitingAt).diff(
                previousStageHistory.enteringAt,
                'days',
                true,
              )
            : moment(moment()).diff(
                previousStageHistory.enteringAt,
                'days',
                true,
              );
        }
        response.push({
          opportunityId: id,
          currentStage: currentStage,
          daysInCurrentStage: daysInCurrentStage,
          previousStage: previousStage,
          daysInPreviousStage: daysInPreviousStage,
        });
      } else {
        response.push({
          opportunityId: id,
          currentStage: null,
          daysInCurrentStage: null,
          previousStage: null,
          daysInPreviousStage: null,
        });
      }
    });

    return ResponseFormatService.responseOk(
      response,
      'All Opportunities Current & Previous Stage and Scores.',
    );
  }
}

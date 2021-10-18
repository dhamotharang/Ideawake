import { StageEmailReminderEnum } from '../../enum/stage-email-reminder.enum';
import { DefaultSort } from '../../enum/default-sort.enum';

export const EMAIL_TEMPLATE = {
  header: `<!DOCTYPE html>
    <html>

    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>Whatstocks</title>
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0;">`,
  footer: `</body>
    </html>`,
};
export const TABLES = {
  TENANT: 'tenant',
  MIGRATIONS: 'migrations',
  EMAIL_TEMPLATE: 'email_template',
  PASSWORD_POLICY: 'password_policy',
  PASSWORD_RESET: 'password_reset',
  USER_COMMUNITIES_COMMUNITY: 'user_communities_community',
  LANGUAGE: 'language',
  THEME: 'theme',
  DOMAIN: 'domain',
  COMMUNITY: 'community',
  INVITE: 'invite',
  USER: 'user',
  CIRCLE: 'circle',
  USER_CIRCLES: 'user_circles',
  TAG: 'tag',
  USER_TAGS: 'user_tags',
  SHORTCUT: 'shortcut',
  USER_SHORTCUTS: 'user_shortcuts',
  BOOKMARK: 'bookmark',
  USER_BOOKMARKS: 'user_bookmarks',
  FOLLOWING_CONTENT: 'following_content',
  USER_FOLLOWING_CONTENT: 'user_following_content',
  ENTITY_TYPE: 'entity_type',
  ACTION_TYPE: 'action_type',
  ACTIVITY: 'activity',
  OPPORTUNITY: 'opportunity',
  OPPORTUNITY_DRAFT: 'opportunity_draft',
  OPPORTUNITY_TYPE: 'opportunity_type',
  LINKED_OPPORTUNITY: 'linked_opportunity',
  OPPORTUNITY_TYPE_POSTING_EXPERIENCE: 'opportunity_type_posting_experience',
  OPPORTUNITY_TYPE_PERMISSION: 'opportunity_type_permission',
  OPPORTUNITY_ATTACHMENT: 'opportunity_attachment',
  COMMUNITY_SETTING: 'community_setting',
  COMMUNITY_BASE_PERMISSION: 'community_base_permission',
  ROLE: 'role',
  USER_ATTACHMENTS: 'user_attachments',
  TAG_REFERENCE_MAPPING: 'tag_reference_mapping',
  VOTE: 'vote',
  COMMENT_THREAD: 'comment_thread',
  COMMENT_THREAD_PARTICIPANT: 'comment_thread_participant',
  COMMENT: 'comment',
  COMMENT_READ_STATUS: 'comment_read_status',
  COMMENT_ATTACHMENT: 'comment_attachment',
  COMMUNITY_APPEARANCE_SETTING: 'community_appearance_setting',
  CHALLENGE: 'challenge',
  CHALLENGE_PARTICIPANT: 'challenge_participant',
  ENTITY_EXPERIENCE_SETTING: 'entity_experience_setting',
  ROLE_ACTORS: 'role_actors',
  COMMUNITY_WISE_PERMISSION: 'community_wise_permission',
  SHARE: 'share',
  COMMUNITY_ACTION_POINT: 'community_action_point',
  USER_ACTION_POINT: 'user_action_point',
  OPPORTUNITY_USER: 'opportunity_user',
  ENTITY_VISIBILITY_SETTING: 'entity_visibility_setting',
  PRIZE: 'prize',
  PRIZE_CATEGORY: 'prize_category',
  PRIZE_AWARDEE: 'prize_awardee',
  WORKFLOW: 'workflow',
  STAGE: 'stage',
  STAGE_NOTIFICATION_SETTING: 'stage_notification_setting',
  STATUS: 'status',
  INTEGRATION: 'integration',
  MENTION: 'mention',
  CHALLENGE_ATTACHMENT: 'challenge_attachment',
  STAGE_ASSIGNEE_SETTINGS: 'stage_assignee_settings',
  STAGE_ASSIGNMENT_SETTINGS: 'stage_assignment_settings',
  ACTION_ITEM: 'action_item',
  CUSTOM_FIELD: 'custom_field',
  CUSTOM_FIELD_TYPE: 'custom_field_type',
  OPPORTUNITY_TYPE_FIELD: 'opportunity_type_field', // Table removed.
  CUSTOM_FIELD_INTEGRATION: 'custom_field_integration',
  CUSTOM_FIELD_DATA: 'custom_field_data',
  OPPORTUNITY_FIELD_LINKAGE: 'opportunity_field_linkage',
  EVALUATION_TYPE: 'evaluation_type',
  EVALUATION_CRITERIA: 'evaluation_criteria',
  EVALUATION_CRITERIA_INTEGRATION: 'evaluation_criteria_integration',
  OPP_EVALUATION_RESPONSE: 'opp_evaluation_response',
  STAGE_HISTORY: 'stage_history',
  FILTER_OPTION: 'filter_option',
  AUTH_INTEGRATION: 'auth_integration',
  BOOKMARKED_VIEW: 'bookmarked_view',
  DASHBOARD: 'dashboard',
  WIDGET: 'widget',
  HOOK_SUBSCRIPTION: 'hook_subscription',
  ANNOUNCEMENT: 'announcement',
  ANNOUNCEMENT_ATTACHMENT: 'announce_attachment',
  ANNOUNCEMENT_TARGETTING: 'announce_targeting',
  BLACKLIST_EMAIL: 'blacklist_email',
  OPPO_EVAL_SUMMARY: 'oppo_eval_summary',
  OPPO_CRIT_EVAL_SUMMARY: 'oppo_crit_eval_summary',
  COLUMN_OPTION: 'column_option',
};

export const BOOLEAN = {
  TRUE: 'true',
  FALSE: 'false',
};

export const USER_TABLE_SELECT =
  'id,created_at,updated_at,is_deleted,updated_by,created_by,first_name,last_name,user_name,role,email,secondary_email,salt,last_login,is_sso,image_url,profile_bio,skills,region,country,zip_code,position,company';

export const DUMMY_DATA_OBJECTS = {
  postIdea: {
    id: '1a73d22e-5b79-4a34-af85-259cbdd3b0f4',
    createdAt: '2019-12-10T10:17:00.458Z',
    updatedAt: '2019-12-10T10:17:00.458Z',
    isDeleted: false,
    updatedBy: null,
    createdBy: null,
    ip: '::1',
    userAgent: 'PostmanRuntime/7.20.1',
    parameter: null,
    entityObjectId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    entityType: {
      id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
      createdAt: '2019-12-10T09:47:14.991Z',
      updatedAt: '2019-12-10T09:47:14.991Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Idea',
      abbreviation: 'idea',
      entityCode: '001',
    },
    actionType: {
      id: 'e702f13e-a49c-47ed-8f6b-c8ad91bb3d4e',
      createdAt: '2019-12-10T09:05:54.379Z',
      updatedAt: '2019-12-10T09:06:55.894Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Post Idea',
      abbreviation: 'post-idea',
    },
    entityObject: {
      title: 'Idea',
      createdAt: '2019-11-28T13:48:21.807Z',
      userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      code: '200',
      id: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    },
  },
  postChallenge: {
    id: '1a73d22e-5b79-4a34-af85-259cbdd3b0f4',
    createdAt: '2019-12-10T10:17:00.458Z',
    updatedAt: '2019-12-10T10:17:00.458Z',
    isDeleted: false,
    updatedBy: null,
    createdBy: null,
    ip: '::1',
    userAgent: 'PostmanRuntime/7.20.1',
    parameter: null,
    entityObjectId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    entityType: {
      id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
      createdAt: '2019-12-10T09:47:14.991Z',
      updatedAt: '2019-12-10T09:47:14.991Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Idea',
      abbreviation: 'idea',
      entityCode: '001',
    },
    actionType: {
      id: 'e702f13e-a49c-47ed-8f6b-c8ad91bb3d4e',
      createdAt: '2019-12-10T09:05:54.379Z',
      updatedAt: '2019-12-10T09:06:55.894Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Post Challenge',
      abbreviation: 'post-challenge',
    },
    entityObject: {
      title: 'Challenge',
      createdAt: '2019-11-28T13:48:21.807Z',
      userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      code: '200',
      id: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    },
  },
  postInsight: {
    id: '1a73d22e-5b79-4a34-af85-259cbdd3b0f4',
    createdAt: '2019-12-10T10:17:00.458Z',
    updatedAt: '2019-12-10T10:17:00.458Z',
    isDeleted: false,
    updatedBy: null,
    createdBy: null,
    ip: '::1',
    userAgent: 'PostmanRuntime/7.20.1',
    parameter: null,
    entityObjectId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    entityType: {
      id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
      createdAt: '2019-12-10T09:47:14.991Z',
      updatedAt: '2019-12-10T09:47:14.991Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Idea',
      abbreviation: 'idea',
      entityCode: '001',
    },
    actionType: {
      id: 'e702f13e-a49c-47ed-8f6b-c8ad91bb3d4e',
      createdAt: '2019-12-10T09:05:54.379Z',
      updatedAt: '2019-12-10T09:06:55.894Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Post Insight',
      abbreviation: 'post-insight',
    },
    entityObject: {
      title: 'Insight',
      createdAt: '2019-11-28T13:48:21.807Z',
      userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      code: '200',
      id: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    },
  },
  comment: {
    id: '1a73d22e-5b79-4a34-af85-259cbdd3b0f4',
    createdAt: '2019-12-10T10:17:00.458Z',
    updatedAt: '2019-12-10T10:17:00.458Z',
    isDeleted: false,
    updatedBy: null,
    createdBy: null,
    ip: '::1',
    userAgent: 'PostmanRuntime/7.20.1',
    parameter: {
      comment: {
        id: '1a73d22e-5b79-4a34-af85-259cbdd3b099',
        body: 'Hello , how are you ?',
        isMentioned: false,
      },
    },
    entityObjectId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    entityType: {
      id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
      createdAt: '2019-12-10T09:47:14.991Z',
      updatedAt: '2019-12-10T09:47:14.991Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Idea',
      abbreviation: 'idea',
      entityCode: '001',
    },
    actionType: {
      id: 'e702f13e-a49c-47ed-8f6b-c8ad91bb3d4e',
      createdAt: '2019-12-10T09:05:54.379Z',
      updatedAt: '2019-12-10T09:06:55.894Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Comment',
      abbreviation: 'comment',
    },
    entityObject: {
      body: 'Idea',
      createdAt: '2019-11-28T13:48:21.807Z',
      userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      code: '200',
      id: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    },
  },
  mentioned: {
    id: '1a73d22e-5b79-4a34-af85-259cbdd3b0f4',
    createdAt: '2019-12-10T10:17:00.458Z',
    updatedAt: '2019-12-10T10:17:00.458Z',
    isDeleted: false,
    updatedBy: null,
    createdBy: null,
    ip: '::1',
    userAgent: 'PostmanRuntime/7.20.1',
    parameter: {
      comment: {
        id: '1a73d22e-5b79-4a34-af85-259cbdd3b099',
        body: 'Hello , how are you @Mustafa ?',
        isMentioned: true,
      },
    },
    entityObjectId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    entityType: {
      id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
      createdAt: '2019-12-10T09:47:14.991Z',
      updatedAt: '2019-12-10T09:47:14.991Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Idea',
      abbreviation: 'idea',
      entityCode: '001',
    },
    actionType: {
      id: 'e702f13e-a49c-47ed-8f6b-c8ad91bb3d4e',
      createdAt: '2019-12-10T09:05:54.379Z',
      updatedAt: '2019-12-10T09:06:55.894Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      name: 'Comment',
      abbreviation: 'comment',
    },
    entityObject: {
      body: 'Idea',
      createdAt: '2019-11-28T13:48:21.807Z',
      userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      code: '200',
      id: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    },
  },

  followingInsight: {
    userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    followingContentId: '56a9b3d7-9d32-4a66-9cdb-96fd9150eb86',
    followingContent: {
      id: '56a9b3d7-9d32-4a66-9cdb-96fd9150eb86',
      createdAt: '2019-12-10T14:06:35.019Z',
      updatedAt: '2019-12-10T14:06:35.019Z',
      isDeleted: false,
      updatedBy: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      createdBy: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      displayName: 'shName',
      entityObjectId: 'c552d0ae-2ec8-44bb-b574-a4577f23431c',
      url: 'http:lll.com',
      email: 'a@a.com',
      entityType: {
        id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
        createdAt: '2019-12-10T09:47:14.991Z',
        updatedAt: '2019-12-10T09:47:14.991Z',
        isDeleted: false,
        updatedBy: null,
        createdBy: null,
        name: 'Insight',
        abbreviation: 'insight',
        entityCode: '002',
      },
    },
    entityObject: {
      id: 'c552d0ae-2ec8-44bb-b574-a4577f23431c',
      createdAt: '2019-11-26T11:23:28.110Z',
      updatedAt: '2019-11-26T11:23:28.110Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      title: 'My Insight',
    },
  },
  followingChallenge: {
    userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    followingContentId: '56a9b3d7-9d32-4a66-9cdb-96fd9150eb86',
    followingContent: {
      id: '56a9b3d7-9d32-4a66-9cdb-96fd9150eb86',
      createdAt: '2019-12-10T14:06:35.019Z',
      updatedAt: '2019-12-10T14:06:35.019Z',
      isDeleted: false,
      updatedBy: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      createdBy: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      displayName: 'shName',
      entityObjectId: 'c552d0ae-2ec8-44bb-b574-a4577f23431c',
      url: 'http:lll.com',
      email: 'a@a.com',
      entityType: {
        id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
        createdAt: '2019-12-10T09:47:14.991Z',
        updatedAt: '2019-12-10T09:47:14.991Z',
        isDeleted: false,
        updatedBy: null,
        createdBy: null,
        name: 'Challenge',
        abbreviation: 'challenge',
        entityCode: '003',
      },
    },
    entityObject: {
      id: 'c552d0ae-2ec8-44bb-b574-a4577f23431c',
      createdAt: '2019-11-26T11:23:28.110Z',
      updatedAt: '2019-11-26T11:23:28.110Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      title: 'My Insight',
    },
  },
  followingOpportunity: {
    userId: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
    followingContentId: '56a9b3d7-9d32-4a66-9cdb-96fd9150eb86',
    followingContent: {
      id: '56a9b3d7-9d32-4a66-9cdb-96fd9150eb86',
      createdAt: '2019-12-10T14:06:35.019Z',
      updatedAt: '2019-12-10T14:06:35.019Z',
      isDeleted: false,
      updatedBy: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      createdBy: 'b84f54c4-5645-4eff-8567-fa8a3297429b',
      displayName: 'shName',
      entityObjectId: 'c552d0ae-2ec8-44bb-b574-a4577f23431c',
      url: 'http:lll.com',
      email: 'a@a.com',
      entityType: {
        id: 'e38f2765-4ed4-4b8d-8d2d-531b015d8cb7',
        createdAt: '2019-12-10T09:47:14.991Z',
        updatedAt: '2019-12-10T09:47:14.991Z',
        isDeleted: false,
        updatedBy: null,
        createdBy: null,
        name: 'Opportunity',
        abbreviation: 'opportunity',
        entityCode: '002',
      },
    },
    entityObject: {
      id: 'c552d0ae-2ec8-44bb-b574-a4577f23431c',
      createdAt: '2019-11-26T11:23:28.110Z',
      updatedAt: '2019-11-26T11:23:28.110Z',
      isDeleted: false,
      updatedBy: null,
      createdBy: null,
      title: 'My Opportunity',
    },
  },
};

export const USER_AVATAR = {
  size: 100,
  background: 'D3F9F1',
  color: '898989',
  type: 'png',
  mimeType: 'image/png',
  bucketPath: 'attachments/users/',
};

export const TIME_LIMITS = {
  START: '00:00:00',
  END: '23:59:59',
};

export const ACTION_TYPES = {
  COMMENT: 'comment',
  FOLLOW: 'follow',
  POST: 'post',
  UPVOTE: 'upvote',
  EDIT: 'edit',
  MENTION: 'mention',
  BOOKMARK: 'bookmark',
  VIEW: 'view',
  SHARE: 'share',
  ACCEPT_INVITE: 'accept_invite',
  ADD_OWNER: 'add_owner',
  REMOVE_OWNER: 'remove_owner',
  ADD_CONTRIBUTOR: 'add_contributor',
  REMOVE_CONTRIBUTOR: 'remove_contributor',
  ADD_SUBMITTER: 'add_submitter',
  REMOVE_SUBMITTER: 'remove_submitter',
  AWARD_PRIZE: 'award_prize',
  INVITE_USER: 'invite_user',
  FORGOT_PASSWORD: 'forgot_password',
  ADD_WORKFLOW: 'add_workflow',
  CHANGE_WORKFLOW: 'change_workflow',
  CHANGE_STAGE: 'change_stage',
};
export const ENTITY_TYPES = {
  IDEA: 'idea',
  COMMENT: 'comment',
  USER: 'user',
  CHALLENGE: 'challenge',
  OPPORTUNITY_TYPE: 'opportunity_type',
  STAGE: 'stage',
  BOOKMARKED_VIEW: 'bookmarked_view',
  VOTE: 'vote',
  INVITE: 'invite',
  ANNOUNCEMENT: 'announcement',
};
export const MENTION_TYPES = {
  COMMENT: 'comment',
  OPPORTUNITY_DESCRIPTION: 'opportunity_description',
  CHALLENGE: 'challenge',
};

export const TEST_EMAIL_TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>{{ subject }}</title>
    <style type="text/css">
      .ReadMsgBody {width: 100%; background-color: #ffffff;}
      .ExternalClass {width: 100%; background-color: #ffffff;}
      body {width: 100%; background-color: #FFFFFF; margin:0; padding:0; -webkit-font-smoothing: antialiased;font-family: Arial, Helvetica, sans-serif;}
      table {border-collapse: collapses;}

      @media only screen and (max-width: 640px)  {
          body[yahoo] .deviceWidth {width:100%!important; padding:0;}
          body[yahoo] .center {text-align: center!important;}
          td.img_Rs img {width:100%!important;max-width: 100%!important;margin: auto;}
        }

      @media only screen and (max-width: 479px) {
          body[yahoo] .deviceWidth {width:100%!important; padding:0;}
          body[yahoo] .center {text-align: center!important;}
          td.img_Rs img {width:100%!important;max-width: 100%!important;margin: auto;}
        }

    </style>
    </head>

    <body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" yahoo="fix" style="font-family: Georgia, Times, serif">
      <!-- Wrapper -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center">
        <tr>
          <td width="100%" valign="top" bgcolor="#F8F8F8" style="padding:10px 10px;">
            <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
              <tr>
                <td align="center" valign="top">
                  <!-- Start Body-->
                  <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
                    <tr>
                      <td align="center" valign="top" style="padding:10px 0px;">
                      <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
                        <tr>
                          <td align="left" valign="top" style="padding:15px 0px 5px 0px;">
                            {{tagLine}}
                          </td>
                        </tr>
                      </table>
                      </td>
                    </tr>
                  </table><!-- End Body -->
                </td>
              </tr>
            </table>
            <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
              <tr>
                <td align="center" valign="top" style="border:1px solid #DEDEDE; border-radius:3px;">
                  <!-- Start Body-->
                  <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
                    <tr>
                      <td bgcolor="#FFFFFF" align="center" valign="top" style="padding:10px 10px;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
                            <tr>
                              <td align="center" valign="top" style="padding:0px 0px 15px 0px;">
                                <img align="center" src="{{featureImage}}" width="600" style="max-width:717px; padding-bottom: 0; display: inline !important; vertical-align: bottom;" class="mcnImage">
                              </td>
                            </tr>

                            <tr>
                            <td align="left" valign="top" style="font-family:Arial, Helvetica, sans-serif; font-size:16px; color:#575858; line-height:24px;">
                              {{body}}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table><!-- End Body -->
                  <table>
                    <tr>
                      <td bgcolor="#F8F8F8" align="center" align="top" style="font-size:14px; color:#575858; line-height:24px; padding:15px 0px 10px 0px; margin: 0;">Having trouble accessing Ideawake? We are here to help!
                        <a style="text-decoration:underline; color: {{ primaryColor }};" href="mailto:support@ideawake.com">Contact Support</a>.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center" bgcolor="#FFFFFF">
            <tr>
              <td align="center" valign="top">
                <!-- Start Body-->
                <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
                  <tr>
                    <td align="center" valign="top" style="padding:5px 0px 10px 0px;">
                      <table width="650" border="0" cellspacing="0" cellpadding="0" class="deviceWidth" align="center">
                        <tr>
                          <td align="left" valign="top" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#575858; line-height:20px; padding:6px 0px;">
                            {{footer}}
                          </td>
                        </tr>
                        <!-- <tr>
                          <td align="left" valign="top" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#575858; line-height:20px; padding:6px 0px;">
                            You can unsubscribe to this email by updating your email preferences or <a href="{{unsubscribeLink}}">this link</a>.
                          </td>
                        </tr> -->
                      </table>
                    </td>
                  </tr>
                </table><!-- End Body -->
              </td>
            </tr>
          </table>
        </tr>
      </table><!-- End Wrapper -->
    </body>
  </html>`;

export const ACTION_ENTITY_MAPPING = [
  { action: ACTION_TYPES.POST, entity: ENTITY_TYPES.IDEA, points: 3 },
  { action: ACTION_TYPES.VIEW, entity: ENTITY_TYPES.IDEA, points: 1 },
  { action: ACTION_TYPES.UPVOTE, entity: ENTITY_TYPES.IDEA, points: 2 },
  { action: ACTION_TYPES.POST, entity: ENTITY_TYPES.COMMENT, points: 2 },
  { action: ACTION_TYPES.COMMENT, entity: ENTITY_TYPES.COMMENT, points: 5 },
  { action: ACTION_TYPES.UPVOTE, entity: ENTITY_TYPES.COMMENT, points: 5 },
  { action: ACTION_TYPES.ACCEPT_INVITE, entity: ENTITY_TYPES.USER, points: 10 },
];

export const PERMISSIONS_MAP = {
  DENY: 0,
  SCENARIO: 1,
  ALLOW: 2,
};

export const DEMO_IPS = [
  '99.7.203.82', //mil
  '69.88.5.10', //huw
  '64.30.228.118', //flo
  '148.72.83.69', //ar
];

export const USER_ACTION_POINT_FUNCTION_OPTIONS = {
  LOCATION: 'locations',
  GROUPS: 'groups',
};

export const PRIZE_CANDIDATE_TYPE = {
  USER: 'user',
  OPPORTUNITY: 'opportunity',
};

export const STAGE_NOTIFICATION_SETTINGS = {
  SUBMITTERS: 'submitter_and_co_submitters',
  OPPORTUNITY_OWNER: 'opportunity_owner',
  TEAM_MEMBERS: 'team_members',
  FOLLOWERS: 'followers',
  VOTERS: 'voters',
  INDIVIDUALS_GROUPS: 'specific_individuals_or_groups',
};

export const ROLE_ABBREVIATIONS = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CHALLENGE_ADMIN: 'challenge_admin',
  CHALLENGE_MODERATOR: 'challenge_moderator',
  CHALLENGE_USER: 'challenge_user',
  GROUP_ADMIN: 'group_admin',
  GROUP_MODERATOR: 'group_moderator',
  GROUP_USER: 'group_user',
  OPPORTUNITY_OWNER: 'opportunity_owner',
  OPPORTUNITY_CONTRIBUTOR: 'opportunity_contributor',
  OPPORTUNITY_SUBMITTER: 'opportunity_submitter',
};

export const ACTION_ITEM_ABBREVIATIONS = {
  NO_TOOL: 'no_tool',
  REFINEMENT: 'refinement',
  VOTING: 'voting',
  SCORECARD: 'scorecard',
};

export const STAGE_EMAIL_REMIDER_TO_SECONDS_MAP = {
  [StageEmailReminderEnum.NEVER]: null,
  [StageEmailReminderEnum.EVERY_WEEK]: 604800,
  [StageEmailReminderEnum.EVERY_TWO_WEEK]: 1209600,
  [StageEmailReminderEnum.EVERY_MONTH]: 2592000,
};

export const STAGE_EMAIL_SETTING_TYPE = {
  NOTIFICATION: 'notification',
  ASSIGNEE: 'assignee',
};

export const PERMISSIONS_KEYS = {
  accessSettings: 'accessSettings',
  accessBasicSettings: 'accessBasicSettings',
  accessAppearanceSettings: 'accessAppearanceSettings',
  accessSecuritySettings: 'accessSecuritySettings',
  accessPointsSettings: 'accessPointsSettings',
  accessIntegrations: 'accessIntegrations',
  manageScheduledEmails: 'manageScheduledEmails',
  manageCommunities: 'manageCommunities',
  manageBillingAndPlan: 'manageBillingAndPlan',
  createNewCommunity: 'createNewCommunity',
  addOpportunityType: 'addOpportunityType',
  editOpportunityType: 'editOpportunityType',
  deleteOpportunityType: 'deleteOpportunityType',
  postOpportunity: 'postOpportunity',
  postChallenge: 'postChallenge',
  editChallengeDetails: 'editChallengeDetails',
  editChallengeSettings: 'editChallengeSettings',
  editChallengeTargetting: 'editChallengeTargetting',
  editChallengePhaseWorkflow: 'editChallengePhaseWorkflow',
  managePrize: 'managePrize',
  awardPrize: 'awardPrize',
  viewOpportunity: 'viewOpportunity',
  editOpportunity: 'editOpportunity',
  addFilesToOpportunity: 'addFilesToOpportunity',
  editOpportunitySettings: 'editOpportunitySettings',
  softDeleteOpportunity: 'softDeleteOpportunity',
  changeOpportunityStage: 'changeOpportunityStage',
  changeOpportunityWorkflow: 'changeOpportunityWorkflow',
  addOpportunityOwner: 'addOpportunityOwner',
  removeOpportunityOwner: 'removeOpportunityOwner',
  addOpportunityContributor: 'addOpportunityContributor',
  removeOpportunityContributor: 'removeOpportunityContributor',
  addOpportunitySubmitter: 'addOpportunitySubmitter',
  removeOpportunitySubmitter: 'removeOpportunitySubmitter',
  exportOpportunity: 'exportOpportunity',
  linkOpportunities: 'linkOpportunities',
  mergeOpportunities: 'mergeOpportunities',
  voteOpportunity: 'voteOpportunity',
  followOpportunity: 'followOpportunity',
  bookmarkOpportunity: 'bookmarkOpportunity',
  shareOpportunity: 'shareOpportunity',
  postComments: 'postComments',
  editComments: 'editComments',
  softDeleteComments: 'softDeleteComments',
  mentionUsers: 'mentionUsers',
  mentionGroups: 'mentionGroups',
  mentionChallengeUsers: 'mentionChallengeUsers',
  mentionAllUsersInChallenge: 'mentionAllUsersInChallenge',
  mentionChallengeGroups: 'mentionChallengeGroups',
  mentionAllGroupsInChallenge: 'mentionAllGroupsInChallenge',
  accessCustomFieldSettings: 'accessCustomFieldSettings',
  createCustomField: 'createCustomField',
  editCustomField: 'editCustomField',
  editCustomFieldOptions: 'editCustomFieldOptions',
  softDeleteCustomField: 'softDeleteCustomField',
  editCustomFieldData: 'editCustomFieldData',
  viewCustomFieldData: 'viewCustomFieldData',
  viewStageSpecificTab: 'viewStageSpecificTab',
  manageOpportunityTypes: 'manageOpportunityTypes',
  manageUserRoles: 'manageUserRoles',
  archiveUser: 'archiveUser',
  manageJumbotron: 'manageJumbotron',
  viewBookmarkedView: 'viewBookmarkedView',
  manageBookmarkedView: 'manageBookmarkedView',
  viewAnnouncement: 'viewAnnouncement',
  manageAnnouncement: 'manageAnnouncement',
  manageOpportunityColumns: 'manageOpportunityColumns',
  manageOpportunityFilters: 'manageOpportunityFilters',
};

export const CUSTOM_FIELD_TYPE_ABBREVIATIONS = {
  USER_GROUP: 'user_or_group',
  USER_SKILLS_TAGS: 'user_skills_tags',
  SINGLE_LINE_TEXT: 'single_line_text',
  MULTI_LINE_TEXT: 'multi_line_text',
  RICH_TEXT: 'rich_text',
  SINGLE_SELECT: 'single_select',
  MULTI_SELECT: 'multi_select',
  DATEPICKER: 'datepicker',
  PROJECTED_BENEFITS: 'projected_benefits',
  PROJECTED_COSTS: 'projected_costs',
  ACTUAL_BENEFITS: 'actual_benefits',
  ACTUAL_COSTS: 'actual_costs',
  NUMBER: 'number',
  CALCULATED_FIELD: 'calculated_field',
  FILE_UPLOAD: 'file_upload',
  VIDEO_UPLOAD: 'video_upload',
  IMAGE_UPLOAD: 'image_upload',
};

export const REMINDER_FREQUENCY_MAPPING = {
  EVERY_WEEK: 168,
  EVERY_TWO_WEEK: 336,
  EVERY_MONTH: 5040,
  NEVER: null,
};
export const MESSAGES_FOR_ACTION_ITEM_NOTIFICATION = {
  REFINEMENT:
    'Please help us determine whether this idea should be progressed to the steering committee for review to be evaluated for implementation or moved to the parking lot for evaluation at later date. Thanks so much for your help.',
};
export const EVALUATION_TYPE_ABBREVIATIONS = {
  NUMBER: 'numerical_range',
  QUESTION: 'question',
};

export const NORMALIZED_TOTAL_CRITERIA_SCORE = 10;

export const NORMALIZED_TOTAL_ENTITY_SCORE = 100;

export const CHALLENGE_SORTING = {
  [DefaultSort.MOST_VOTES]: { key: 'vote', type: 'DESC' },
  [DefaultSort.NEWEST]: { key: 'opportunity.createdAt', type: 'DESC' },
  [DefaultSort.OLDEST]: { key: 'opportunity.createdAt', type: 'ASC' },
  [DefaultSort.MOST_COMMENTS]: { key: 'comment', type: 'DESC' },
  [DefaultSort.RANDOM]: { key: 'id', type: 'DESC' },
};

export const COMMUNITY_ROLE_LEVELS = {
  [ROLE_ABBREVIATIONS.ADMIN]: 1,
  [ROLE_ABBREVIATIONS.MODERATOR]: 2,
  [ROLE_ABBREVIATIONS.USER]: 3,
};

export const INNO_BOT = {
  name: 'InnoBot',
  email: 'innobot@ideawake.com',
};

export const INDEXES = {
  COMMUNITY: 'community',
  OPPORTUNITY: 'opportunity',
  OPPORTUNITY_TYPE: 'opportunity_type',
  CHALLENGE: 'challenge',
  USER: 'user',
  TAG: 'tag',
};

export const NON_PERMISSION_COLUMNS = [
  'id',
  'createdAt',
  'updatedAt',
  'isDeleted',
  'updatedBy',
  'createdBy',
  'role',
  'roleId',
  'community',
  'communityId',
];

export const AUTH_SCOPES = {
  EXTERNAL: 'external',
};

export const OPPORTUNITY_IMPORT_COLUMNS = [
  'title',
  'description',
  'anonymous',
  'draft',
  'owners',
  'submitters',
  'contributors',
  'opportunityType',
  'community',
  '$custom',
  'stage',
  'workflow',
  '_attachments',
  '_isCustomFieldRaw',
  '_challenge',
  '_isDeleted',
  '_votes',
  '_comments',
  'oldPlatformId',
];

export const EMAIL_BOOKMARKS = {
  BODY: '{{body}}',
  SUBJECT: '{{ subject }}',
  FOOTER: '{{footer}}',
  FIRST_NAME: '{{firstName}}',
  OPPORTUNITY_NUMBER: '{{opportunityNumber}}',
  OPPORTUNITY_TITLE: '{{opportunityTitle}}',
  OPPORTUNITY_DESCRIPTION: '{{opportunityDescription}}',
  COMPANY_NAME: '{{companyName}}',
  COMMUNITY_NAME: '{{communityName}}',
  LINK_BTN: '{{linkButton}}',
  TAG_LINE: '{{tagLine}}',
  FEATURE_IMG: '{{featureImage}}',
  CURR_WORKFLOW_TITLE: '{{currentWorkflowTitle}}',
  PREV_WORKFLOW_TITLE: '{{previousWorkflowTitle}}',
  CURR_STAGE_TITLE: '{{currentStageTitle}}',
  CURR_STAGE_DESC: '{{currentStageDescription}}',
  PREV_STAGE_TITLE: '{{previousStageTitle}}',
  PREV_STAGE_DESC: '{{previousStageDescription}}',
  CUSTOM_MESSAGE: '{{customMessage}}',
  POST_TYPE: '{{postType}}',
  UPDATE_TITLE: '{{updateTitle}}',
  UPDATE_MESSAGE: '{{updateMessage}}',
  VIEW_UPDATE_BTN: '{{viewUpdatesBtn}}',
  VIEW_CHALLENGE_OPPO_BTN: '{{viewChallengeOpportunityBtn}}',
};

export const ENVIRONMENTS = {
  DEVELOP: 'development',
  PRODUCTION: 'production',
};

export const COOKIE_SAME_SITE_TYPES = {
  NONE: 'none',
  LAX: 'LAX',
};

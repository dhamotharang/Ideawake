import { ChallengeSettings, CommunityAppearance } from './models';

import { ChartType } from 'chart.js';

export const LINK_SVG = `https://ideawake-test.s3.amazonaws.com/attachments/opportunity/link.png`;

export const MODAL_CONTAINER_CONSTANTS = {
  'create-group': 'CreateGroupsComponent',
  'edit-group': 'EditGroupModalComponent',
  'edit-profile': 'EditProfileModalComponent',
  'edit-idea': 'EditIdeaModalComponent'
};

export const IDEA_TABS = {
  moreInfo: {
    key: 'moreInfo',
    title: 'Refine Idea'
    // icon: 'info-circle'
  },
  questions: {
    key: 'questions',
    title: 'Evaluations'
    // icon: 'question-circle'
  },
  summary: {
    key: 'summary',
    title: 'About'
    // icon: 'home'
  },
  files: {
    key: 'files',
    title: 'Attachments'
    // icon: 'paperclip'
  },
  // build: {
  //   key: 'build',
  //   title: 'Workspace'
  //   icon: 'rocket'
  // },
  activity: {
    key: 'activity',
    title: 'Activity'
    // icon: 'stream'
  }
  // tasks: {
  //   key: 'tasks',
  //   title: 'Tasks'
  //   icon: 'tasks'
  // }
  // outcomes: {
  //   key: 'outcomes',
  //   title: 'Impact',
  //   icon: 'badge-dollar'
  // }
};

export const PROFILE_PAGE_TABS = {
  SUMMARY: {
    key: 'summary',
    title: 'Summary',
    icon: 'home'
  },
  // ACTION: {
  //   key: 'action',
  //   title: 'Action Items',
  //   icon: 'flag'
  // },
  // IDEAS: {
  //   key: 'ideas',
  //   title: 'My Ideas',
  //   icon: 'lightbulb'
  // },
  // ACHIEVEMENTS: {
  //   key: 'achievements',
  //   title: 'Achievements',
  //   icon: 'certificate'
  // },
  BOOKMARKS: {
    key: 'bookmarks',
    title: 'Bookmarks',
    icon: 'bookmark'
  },
  FOLLOWINGS: {
    key: 'followings',
    title: 'Following',
    icon: 'rss'
  }
};

export const BOOKMARK_FILTERS = {
  all: {
    key: 'all',
    title: 'All Bookmarks'
  },
  idea: {
    key: 'idea',
    title: 'Ideas'
  }
  // insight: {
  //   key: 'insight',
  //   title: 'Insights'
  // }
};

export const FOLLOW_FILTERS = {
  all: {
    key: 'all',
    title: 'All Following'
  },
  idea: {
    key: 'idea',
    title: 'Ideas'
  },
  challenges: {
    key: 'challenges',
    title: 'Challenges'
  },
  // insights: {
  //   key: 'insight',
  //   title: 'Insights'
  // },
  user: {
    key: 'user',
    title: 'Users'
  }
  // tags: {
  //   key: 'tags',
  //   title: 'Tags'
  // }
};

export const CONTENT_CARD_TYPE = {
  OPPORTUNITY: 'opportunity',
  USER: 'user'
};

export const IDEA_SORT_FILTERS = {
  // 'Top Score': {
  //   sortBy: 'score',
  //   sortType: 'DESC'
  // },
  'Most Votes': {
    languageKey: 'Shared.MostVotes',
    sortBy: 'vote',
    sortType: 'DESC'
  },
  'Most Comments': {
    languageKey: 'Shared.MostComments',
    sortBy: 'comment',
    sortType: 'DESC'
  },
  Random: {
    languageKey: 'Shared.Random',
    sortBy: 'random',
    sortType: 'DESC'
  },
  Newest: {
    languageKey: 'Shared.Newest',
    sortBy: 'createdAt',
    sortType: 'DESC'
  },
  Oldest: {
    languageKey: 'Shared.Oldest',
    sortBy: 'createdAt',
    sortType: 'ASC'
  }
};

export const MENTION_TYPES = {
  USER: 'user',
  GROUP: 'group'
};

export const ENTITY_TYPE = {
  USER: 'user',
  IDEA: 'idea',
  STAGE: 'stage',
  CHALLENGE: 'challenge',
  OPPORTUNITY_TYPE: 'opportunity_type',
  COMMENT: 'comment',
  CIRCLE: 'circle'
};

export const NotificationMessages = {
  ADDED_TO_FOLLOWING: 'Alerts.FollowSuccess',
  REMOVED_FROM_FOLLOWING: 'Alerts.FollowRemove',
  ERROR: 'Something Went Wrong',
  SELF_FOLLOWING: 'You cannot follow yourself'
};

export const EMAIL_TEMPLATE_TABS = {
  emailBody: {
    key: 'emailBody',
    icon: 'info-circle',
    title: 'Email Body and Details'
  },
  history: {
    key: 'history',
    icon: 'clock',
    title: 'History & Logs'
  }
};

export const LANGUAGES: any = [
  {
    key: 'en',
    alt: 'United States',
    title: 'English'
  },
  {
    key: 'itl',
    alt: 'Italy',
    title: 'Italiano'
  },
  {
    key: 'de',
    alt: 'German',
    title: 'German'
  },
  {
    key: 'es',
    alt: 'Spain',
    title: 'Español'
  },
  {
    key: 'pt',
    alt: 'Portugal',
    title: 'Português'
  }
  // {
  //   key: 'fr',
  //   alt: 'France',
  //   title: 'French'
  // },
  // {
  //   key: 'ar',
  //   alt: 'Arabia',
  //   title: 'العربية'
  // }
];

export const COMMUNITY_APPEARANCE: CommunityAppearance = {
  accentColor: '#dddddd',
  primaryColor: '#1ab394',
  footerBackgroundColor: '#2f4050',
  footerTextColor: '#fff',
  navigationBackgroundColor: '#727cf5',
  navigationTextColor: '#fff',
  defaultLogo:
    'https://ideawake.com/wp-content/uploads/2017/11/Idewake-Innovation-Management-Logo.png',
  mobileLogo: '',
  favicon: '',
  emailFeaturedImage: '',
  jumbotronPageTitle: `Make Your Voice Heard at {{communityName}}.`,
  jumbotronBackgroundImage:
    'https://prediction-market.s3.amazonaws.com/Ideawake%20Demo/56620cbc49ab311256486be4/challengePage/FeaturedBGImage.png',
  jumbotronPageDescription: `Post your ideas to improve culture and operations at
  {{communityName}} for the chance to earn recognition and win prizes.`
};

export const ACTIVITY_SORTING = {
  DESC: 'Newest First',
  ASC: 'Oldest First'
};

export const ACTIVITY_ICONS = {
  view: 'eye',
  review: 'star',
  link: 'link',
  merge: 'code-merge',
  status: 'conveyor-belt-alt',
  follow: 'rss',
  upvote: 'thumbs-up',
  edit: 'edit',
  comment: 'comment',
  post: 'lightbulb',
  share: 'share-alt',
  bookmark: 'bookmark',
  add_owner: 'plus',
  remove_owner: 'times-circle',
  add_contributor: 'plus',
  remove_contributor: 'times-circle',
  add_submitter: 'plus',
  award_prize: 'award',
  remove_submitter: 'times-circle',
  add_workflow: 'plus',
  change_workflow: 'exchange',
  change_stage: 'exchange'
};

export const ACTIVITY_ACTION_TYPES = {
  mention: 'mention',
  view: 'view',
  follow: 'follow',
  upvote: 'upvote',
  edit: 'edit',
  comment: 'comment',
  post: 'post',
  share: 'share',
  bookmark: 'bookmark',
  add_owner: 'add_owner',
  remove_owner: 'remove_owner',
  add_contributor: 'add_contributor',
  remove_contributor: 'remove_contributor',
  add_submitter: 'add_submitter',
  award_prize: 'award_prize',
  remove_submitter: 'remove_submitter',
  add_workflow: 'add_workflow',
  change_workflow: 'change_workflow',
  change_stage: 'change_stage'
};

export const LEADERBOARD_STATS_FREQUENCY = {
  MONThLY: 'month',
  WEEKLY: 'week',
  ALL_TIME: 'open'
};

export const CURRENT_IDEA_ACTIVITY = {
  view: 'viewed this',
  review: 'reviewed this',
  link: 'linked this',
  merge: 'merged this',
  status: 'status changed of this',
  follow: 'followed this',
  upvote: 'upvoted on this',
  edit: 'edited this',
  comment: 'commented on this',
  post: 'posted this',
  share: 'shared this',
  bookmark: 'bookmarked this',
  add_owner: 'added',
  remove_owner: 'removed',
  add_contributor: 'added',
  remove_contributor: 'removed',
  add_submitter: 'added',
  award_prize: 'awarded',
  remove_submitter: 'removed',
  add_workflow: 'added this',
  change_workflow: 'changed the workflow of this',
  change_stage: 'changed the stage of this'
};

export const ACTIVITY_PHRASE = {
  view: 'viewed',
  review: 'reviewed',
  link: 'linked',
  merge: 'merged',
  status: 'status changed',
  follow: 'followed',
  upvote: 'upvoted',
  edit: 'edited',
  comment: 'commented on',
  post: 'posted',
  share: 'shared',
  bookmark: 'bookmarked',
  add_owner: 'added',
  remove_owner: 'removed',
  add_contributor: 'added',
  remove_contributor: 'removed',
  add_submitter: 'added',
  award_prize: 'awarded',
  remove_submitter: 'removed',
  add_workflow: 'added',
  change_workflow: 'changed the workflow of',
  change_stage: 'changed the stage of'
};

export const CHALLENGE_DEFAULT_BANNER =
  'https://prediction-market.s3.amazonaws.com/Ideawake%20Demo/56620cbc49ab311256486be4/challengePage/FeaturedBGImage.png';

export const OPPORTUNITY_DEFAULT_BANNER =
  'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/DefaultOppo.png';

export const UPDATES_DEFAULT_BANNER =
  'https://prediction-market.s3.amazonaws.com/OSF%20HealthCare/5ccbe853301663001fd9075a/challenges/ChallengeButton1.png';

export const OPPORTUNITY_PERMISSIONS = {
  allowVoting: true,
  allowCommenting: true,
  allowSharing: true,
  allowAnonymousIdea: true,
  allowAnonymousComment: true,
  allowAnonymousVote: true,
  allowOpportunityCosubmitters: true,
  allowOpportunityOwnership: true,
  allowOpportunityTeams: true,
  allowSubmissions: true,
  allowTeamBasedOpportunity: true,
  assignMergedContributorsToParent: true,
  assignMergedCosubmittersToParent: true,
  assignOpportunitySubmitterAsContributor: true,
  assignOpportunitySubmitterAsOwner: true,
  defaultAnonymousComments: false,
  defaultAnonymousSubmissions: false,
  defaultAnonymousVotes: false,
  defaultSort: null,
  displayAlert: false
};

export const IDEA_USERS = {
  owner: {
    key: 'owner',
    saveTitle: 'Add Owners',
    title: 'Add Owners to Idea'
  },
  contributors: {
    key: 'contributor',
    saveTitle: 'Add Team Members',
    title: 'Add Team Members to Idea'
  },
  submitter: {
    key: 'submitter',
    saveTitle: 'Add Co-Submitters',
    title: 'Add Co-submitters to This Idea'
  }
};

export const PERMISSION_LEVEL = {
  COMMUNITY: 'community',
  USER: 'USER',
  OPPORTUNITY: 'opportunity',
  CHALLENGE: 'challenge'
};

export const POINTS_NOTIFICATION = {
  follow: 'Followed an idea',
  upvote: 'Upvoted an idea',
  edit: 'Edited an idea',
  comment: 'Commented on an idea',
  post: 'Posted an idea',
  bookmark: 'Bookmarked an idea',
  mention: 'Mentioned in an idea',
  view: 'Viewed an idea',
  share: 'Shared an idea'
};

export const ACCESS_ROUTE_PERMISSIONS = {
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
  viewOpportunity: 'viewOpportunity',
  editOpportunity: 'editOpportunity',
  addFilesToOpportunity: 'addFilesToOpportunity',
  editOpportunitySettings: 'editOpportunitySettings',
  softDeleteOpportunity: 'softDeleteOpportunity',
  changeOpportunityStage: 'changeOpportunityStage',
  changeOpportunityWorkflow: 'changeOpportunityWorkflow',
  manageOpportunityTypes: 'manageOpportunityTypes',
  accessCustomFieldSettings: 'accessCustomFieldSettings',
  addOpportunityOwner: 'addOpportunityOwner',
  removeOpportunityOwner: 'removeOpportunityOwner',
  addOpportunityContributor: 'addOpportunityContributor',
  removeOpportunityContributor: 'removeOpportunityContributor',
  addOpportunitySubmitter: 'addOpportunitySubmitter',
  removeOpportunitySubmitter: 'removeOpportunitySubmitter',
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
  mentionChallengeUserParticipants: 'mentionChallengeUserParticipants',
  mentionAllUsersInChallenge: 'mentionAllUsersInChallenge',
  mentionChallengeGroupParticipants: 'mentionChallengeGroupParticipants',
  mentionAllGroupsInChallenge: 'mentionAllGroupsInChallenge',
  viewChallenge: 'viewChallenge',
  manageAnnouncement: 'manageAnnouncement',
  viewAnnouncement: 'viewAnnouncement'
};

export const EDIT_OPPORTUNITY = {
  edit: {
    key: 'edit',
    title: 'EDIT',
    icon: 'edit'
  },
  // link: {
  //   key: 'link',
  //   title: 'LINK',
  //   icon: 'link'
  // },
  // merge: {
  //   key: 'merge',
  //   title: 'MERGE',
  //   icon: 'code-merge'
  // },
  // workflow: {
  //   key: 'workflow',
  //   title: 'WORKFLOW',
  //   icon: 'conveyor-belt-alt'
  // },
  settings: {
    key: 'settings',
    title: 'SETTINGS',
    icon: 'cog'
  }
};

export const ENTITY_VISIBILITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  GROUPS: 'groups'
};

export const PRIZE_CATEGORY = {
  things: 'shapes',
  money: 'money-bill-wave',
  experiences: 'plane-departure',
  other: 'info-circle'
};

export const PRIZE_CANDIDATE_TYPE = {
  USER: 'user',
  OPPORTUNITY: 'opportunity'
};

export const TOP_USER_TYPE = {
  COMMUNITY: 'community',
  CHALLENGE: 'challenge'
};

export const TOP_GROUP_TYPE = {
  COMMUNITY: 'community',
  CHALLENGE: 'challenge'
};

export const ANALYTICS = {
  ChartType: {
    BarChart: 'bar' as ChartType,
    DoughNut: 'doughnut' as ChartType,
    PieChart: 'pie' as ChartType,
    LineChart: 'line' as ChartType,
    Bubble: 'bubble' as ChartType
  },
  collections: {
    submissions: {
      term: 'submissions',
      color: '#1ab394'
    },
    votes: {
      term: 'votes',
      color: '#727cf5'
    },
    comments: {
      term: 'comments',
      color: '#6c757d'
    },
    shares: {
      term: 'shares',
      color: '#39afd1'
    },
    participated: {
      term: 'participated'
    },
    targeted: {
      term: 'targeted'
    },
    viewed: {
      term: 'viewed'
    }
  }
};

export const STAGE_NOTIFICATION_SETTINGS = {
  SUBMITTERS: 'submitter_and_co_submitters',
  OPPORTUNITY_OWNER: 'opportunity_owner',
  TEAM_MEMBERS: 'team_members',
  FOLLOWERS: 'followers',
  VOTERS: 'voters',
  INDIVIDUALS_GROUPS: 'specific_individuals_or_groups'
};

export const NOTIFICATION_STRINGS = {
  view: 'viewed your',
  follow: 'followed your',
  upvote: 'voted for your',
  edit: 'edited your',
  comment: 'posted a new comment on your',
  post: 'posted',
  share: 'shared',
  bookmark: 'bookmarked your',
  add_owner: 'added you as an owner on',
  remove_owner: 'removed you as an owner from',
  add_contributor: 'added you as an team member on',
  remove_contributor: 'removed you as an team member on',
  add_submitter: 'added you as co-submitter on',
  remove_submitter: 'removed you as a co-submitter on',
  award_prize: 'awarded',
  add_workflow: 'added your',
  change_workflow: 'changed the workflow of',
  change_stage: 'changed the stage of'
};

export const NOTIFICATION_MENTION = {
  type: {
    opportunityDescription: 'opportunity_description',
    comment: 'comment'
  },
  mentionedObjectType: {
    group: 'group',
    user: 'user'
  }
};

export const StageEmailReminderEnum = [
  { key: 'never', name: 'Never' },
  { key: 'every_week', name: 'Every Week' },
  { key: 'every_two_week', name: 'Every Two Weeks' },
  { key: 'every_month', name: 'Every Month' }
];

export const ACTION_ITEM_ICONS = {
  no_tool: {
    icon: 'minus-square',
    background: 'bg-dark',
    color: 'text-muted'
  },
  refinement: {
    icon: 'pen-square',
    background: 'bg-secondary',
    color: 'text-secondary'
  },
  voting: {
    icon: 'thumbs-up',
    background: 'bg-primary',
    color: 'text-primary'
  },
  scorecard: {
    icon: 'poll',
    background: 'bg-warning',
    color: 'text-warning'
  },
  decision_question_poll: {
    icon: 'question-circle',
    background: 'bg-tertiary',
    color: 'text-secondary'
  },
  implement: {
    icon: 'rocket',
    background: 'bg-tertiary',
    color: 'text-muted'
  }
};

export const ACTION_ITEM_INFO = {
  no_tool: {
    title: 'Please complete',
    instruction: '',
    abbreviation: 'no_tool',
    stageName: '',
    stageDescription: '',
    actionItemTitle: '',
    stageSpecificInstructions: ''
  },
  refinement: {
    title: 'Please Help Further Refine This Idea',
    instruction:
      'Please help us further assess this ideas potential by filling out the additional information about it below',
    stageName: 'Refine Ideas',
    abbreviation: 'refinement',
    stageDescription:
      'During this stage, community members will be submitting further information about this idea to help assess its potential.'
  },
  voting: {
    title: 'Please complete voting',
    abbreviation: 'voting',
    instruction: ''
  },
  scorecard: {
    title: 'Please Complete a Review on This Idea',
    instruction:
      'Please help us further assess this ideas' +
      ' potential by filling out the questions about' +
      ' it below. Once you’ve completed your evaluation,' +
      ' please don’t forget to click on the “Submit” button.',
    stageName: 'Review Ideas',
    abbreviation: 'scorecard',
    stageDescription:
      // tslint:disable-next-line: max-line-length
      'During this stage, evaluators will be ranking ideas based on custom criteria to determine whether to progress them or put them on hold for later evaluation.'
  },
  decision_question_poll: {
    title: 'Please Complete a Review on This Idea ',
    instruction:
      'Please help us further assess this ideas' +
      ' potential by filling out the questions about' +
      ' it below. Once you’ve completed your evaluation,' +
      ' please don’t forget to click on the “Submit” button.',
    stageName: 'Review Ideas',
    abbreviation: 'decision_question_poll',
    stageDescription:
      'During this stage, evaluators will be ranking ideas to determine whether they .'
  },
  implement: {
    title: 'Please complete implement',
    instruction: ''
  }
};

export const ACTION_ITEM_ABBREVIATIONS = {
  NO_TOOL: 'no_tool',
  REFINEMENT: 'refinement',
  VOTING: 'voting',
  SCORECARD: 'scorecard',
  DECISION: 'decision_question_poll'
};

export const TOOLS_COMPLETION_SETTINGS = {
  refinement: {
    min_response_btn: 'Minimum Number of Fields',
    all_btn: 'All Fields Completed',
    min_response_label: 'Enter Number of Fields',
    min_response_postfix: 'Fields'
  },
  else: {
    min_response_btn: 'Minimum Number of Responses',
    all_btn: 'All Assignees Completed',
    min_response_label: 'Enter Number of Responses',
    min_response_postfix: 'Responses'
  }
};
export const INITIAL_STAGE_ASSIGNEE_SETTINGS = {
  groups: [],
  individuals: [],
  communityAdmins: true,
  communityModerators: false,
  communityUsers: false,
  opportunityOwners: false,
  opportunityTeams: false,
  opportunitySubmitters: false,
  allMembers: false
};

export const INITIAL_STAGE_ACTIVITY_VISIBILITY_SETTINGS = {
  groups: [],
  individuals: [],
  communityAdmins: true,
  communityModerators: false,
  communityUsers: false,
  opportunityOwners: false,
  opportunityTeams: false,
  opportunitySubmitters: false,
  allMembers: false
};

export const INITIAL_STAGE_ASSIGNMENT_SETTINGS = {
  emailNotification: false,
  emailReminder: 'never',
  stageComments: true,
  allAssigneesCompleted: true,
  stageTimeLimit: 0
};

export const INITIAL_STAGE_NOTIFICATION_SETTINGS = {
  groups: [],
  individuals: [],
  opportunityOwners: true,
  opportunityTeams: false,
  opportunitySubmitters: true,
  followers: false,
  voters: false,
  sendEmail: true
};

export const CustomFieldCategories = [
  { key: 'user_fields', title: 'User Fields' },
  { key: 'collect_information', title: 'Collect Information' },
  { key: 'choosing', title: 'Choosing' },
  {
    key: 'benefits_costs_and_resources',
    title: 'Benefits, Costs And Resources'
  },
  { key: 'values', title: 'Values' },
  { key: 'uploads', title: 'Uploads' }
];

export const CustomFieldRoles = [
  {
    ids: [],
    keys: ['admin', 'moderator'],
    title: 'Administrators and Moderators Only',
    description: 'All users who have access to idea can act on this field.'
  },
  {
    ids: [],
    keys: ['admin', 'moderator', 'opportunity_owner'],
    title: 'Idea Owners',
    description:
      'Only idea owners, moderators, and admins can act on this field.'
  },
  {
    ids: [],
    keys: [
      'admin',
      'moderator',
      'opportunity_owner',
      'opportunity_contributor'
    ],
    title: 'Team Members',
    description:
      'Only team members, idea owners, moderators, and admins can act on this field.'
  },
  {
    ids: [],
    keys: [],
    title: 'Public',
    description: 'All users who have access to idea can act on this field.'
  }
];

export const CUSTOM_FIELD_TYPES = {
  COMMUNITY_USER_GROUP: 'user_or_group',
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
  CALCULATED_FIELDS: 'calculated_field',
  FILE_UPLOAD: 'file_upload',
  VIDEO_UPLOAD: 'video_upload',
  IMAGE_UPLOAD: 'image_upload'
};

export const FIELD_DATA_TYPE = {
  TEXT: 'text',
  SELECTED: 'selected',
  DATE: 'date',
  FILE: 'file',
  NUMBER: 'number'
};

export const PERMISSIONS_MAP = {
  NO_ACCESS: 0,
  PARTIAL_ACCESS: 1,
  FULL_ACCESS: 2
};

export const ENTITY_FOLDER = {
  COMMUNITY: 'community',
  CHALLENGE: 'challenge',
  OPPORTUNITY: 'opportunity-attachment',
  PRIZE: 'prize',
  CUSTOM_FIELDS: 'custom-field'
};

export const CUSTOM_FIELD_EXPERIENCE_ROLES = {
  'Administrators and Moderators Only': {
    bg: 'badge-dark',
    viewTooltip:
      'Only Administrators and Moderators can see or complete this field',
    editTooltip: 'Only Administrators and Moderators can edit this field'
  },
  'Idea Owners': {
    bg: 'badge-secondary',
    viewTooltip:
      'Only Administrators, Moderators and Owners can see or complete this field',
    editTooltip: 'Only Administrators and Moderators can edit this field'
  },
  'Team Members': {
    bg: 'badge-info',
    viewTooltip:
      'Only Team Members, Owners, Moderators, and admins can see or complete this field',
    editTooltip:
      'Only Team Members, Owners, Moderators, and admins can edit this field'
  },
  Public: {
    bg: 'badge-light',
    viewTooltip:
      'Anyone who has access to this opportunity can view this field',
    editTooltip: 'Anyone who has access to this opportunity can edit this field'
  }
};

export const FIELD_INTEGRATION = {
  SUBMISSION_FORM: 'submission_form',
  OPPORTUNITY_CONTAINER: 'opportunity_container',
  REFINEMENT_TAB: 'refinement_tab'
};

export const SOUNDS = {
  NOTIFICATION:
    'https://ideawake-test.s3.amazonaws.com/attachments/opportunity/1594518749756light.mp3',
  ACTION_ITEM:
    'https://ideawake-test.s3.amazonaws.com/attachments/opportunity/1594518614169juntos.mp3'
};

export const EVALUATION_TYPES_ABBREVIATION = {
  QUESTION: 'question',
  NUMERICAL_RANGE: 'numerical_range'
};

export const EVALUATION_TYPES = {
  question: {
    action: 'question',
    button: 'Add New Question'
  },
  numerical_range: {
    action: 'numerical_range',
    button: 'Add New Rating'
  }
};

export const CHALLENGE_STATUSES = {
  closed: {
    badge_bg: 'badge-danger',
    font_bg: 'text-danger',
    status: 'Closed',
    defaultMessage:
      'This challenge is now closed, thanks for participating and keep sharing your ideas by checking out the challenges that are currently open.'
  },
  evaluation: {
    badge_bg: 'badge-warning',
    font_bg: 'text-warning',
    status: 'Evaluation',
    defaultMessage:
      'Thanks for participating in this challenge! New submissions are no longer open, but top submissions are currently being reviewed. We will keep you posted and provide an update once winners are announced!'
  },
  open: {
    badge_bg: 'badge-success',
    font_bg: 'text-success',
    status: 'Open',
    defaultMessage: null
  }
};

export const CHALLENGE_STATUSES_ABBR = {
  OPEN: 'open',
  EVALUATION: 'evaluation',
  CLOSED: 'closed'
};

export const OPEN_CHALLENGE_DEFAULTS = {
  allowSubmissions: true,
  allowVoting: false,
  allowCommenting: true,
  allowSharing: true,
  displayAlert: false,
  defaultSort: 'newest'
} as ChallengeSettings;

export const EVALUATION_CHALLENGE_DEFAULTS = {
  allowSubmissions: false,
  allowVoting: true,
  allowCommenting: true,
  allowSharing: true,
  displayAlert: true,
  defaultSort: 'random'
} as ChallengeSettings;

export const CLOSED_CHALLENGE_DEFAULTS = {
  allowSubmissions: false,
  allowVoting: false,
  allowCommenting: false,
  allowSharing: true,
  displayAlert: true,
  defaultSort: 'most_votes'
} as ChallengeSettings;

export const MANAGE_ACTIONS = {
  settings: 'settings',
  workflow: 'workflow',
  stage: 'stage',
  edit: 'edit',
  archive: 'archive'
};

export const ON_PAGE_DEFAULT_FILTERS = [
  {
    order: 1,
    selected: true,
    onPage: true,
    uniqueId: 'workflow_stage',
    title: 'Workflow Stage'
  },
  {
    order: 2,
    selected: true,
    onPage: true,
    uniqueId: 'status',
    title: 'Status'
  },
  {
    order: 3,
    selected: false,
    onPage: true,
    uniqueId: 'opportunity_type',
    title: 'Opportunity Type'
  },
  { order: 4, selected: true, onPage: true, uniqueId: 'tags', title: 'Tags' },
  {
    order: 5,
    selected: true,
    onPage: true,
    uniqueId: 'challenges',
    title: 'Challenges'
  }
];

export const IDEA_LIST_DEFAULT_COLUMNS = [
  {
    order: 0,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'idAndTitle',
    title: 'ID and Title'
  },
  {
    order: 1,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'totalScore',
    title: 'Total Score'
  },
  {
    order: 2,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'currentStage',
    title: 'Current Stage',
    thClass: 'py-2 border-top-0 border-bottom-0 columnWidthCurrentStage'
  },
  {
    order: 3,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'currentStageScore',
    title: 'Current Stage Score'
  },
  {
    order: 4,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'assignedTo',
    title: 'Assigned To',
    thClass: 'py-2 border-top-0 border-bottom-0 columnWidthLarge'
  },
  {
    order: 5,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'dueDate',
    title: 'Due Date'
  },
  {
    order: 6,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'ownersWidget',
    title: 'Owners'
  },
  {
    order: 7,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'teamMembersWidget',
    title: 'Team Members'
  },
  {
    order: 8,
    type: 'static',
    selected: true,
    onPage: true,
    uniqueId: 'submittersWidget',
    title: 'Submitters'
  }
];

export const IDEA_LIST_OTHER_COLUMNS = [
  {
    order: 9,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'opportunityType',
    title: 'Opportunity Type'
  },
  {
    order: 10,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'description',
    title: 'Description'
  },
  {
    order: 11,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'challengeName',
    title: 'Challenge Name'
  },
  {
    order: 12,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'createdDate',
    title: 'Created Date'
  },
  {
    order: 13,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'submitterMember',
    title: 'Groups that Submitter is a Member of'
  },
  {
    order: 14,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'tags',
    title: 'Tags'
  },
  {
    order: 15,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'currentWorkflow',
    title: 'Current Workflow'
  },
  {
    order: 16,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'previousStage',
    title: 'Previous Stage'
  },
  {
    order: 16,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'daysInPreviousStage',
    title: 'Days in Previous Stage'
  },
  {
    order: 17,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'daysInCurrentStage',
    title: 'Days in Current Stage'
  },
  {
    order: 18,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'currentStatus',
    title: 'Current Status'
  },
  {
    order: 19,
    type: 'static',
    selected: false,
    onPage: true,
    uniqueId: 'daysInCurrentStatus',
    title: 'Days in Current Status'
  }
];

export const PAGE_TYPE_ENUM = {
  table: 'table',
  card: 'card',
  challenge: 'challenge',
  chart: 'chart'
};

export const EMAIL_TEMPLATE_TYPES = {
  FORGOT_PASSWORD: 'Forgot Password',
  INVITE_USER: 'Invite User',
  ADD_WORKFLOW_TO_AN_OPPORTUNITY: 'Add Workflow to an Opportunity',
  CHANGE_WORKFLOW_OF_AN_OPPORTUNITY: 'Change Workflow of an Opportunity',
  CHANGE_STAGE_OF_AN_OPPORTUNITY: 'Change Stage of an Opportunity',
  UPDATES: 'Updates'
};

export const COMMUNITY_SSO_LOGIN_ENUM = {
  DISABLED: 'disabled',
  ONLY_SSO: 'only_sso',
  BOTH: 'both'
};

export const COLOR_LIST = [
  '#1ab394',
  '#000105',
  '#3e6158',
  '#3f7a89',
  '#96c582',
  '#b7d5c4',
  '#bcd6e7',
  '#7c90c1',
  '#9d8594',
  '#dad0d8',
  '#4b4fce',
  '#4e0a77',
  '#a367b5',
  '#ee3e6d',
  '#d63d62',
  '#c6a670',
  '#f46600',
  '#cf0500',
  '#efabbd',
  '#8e0622',
  '#f0ca68',
  '#62382f',
  '#c97545',
  '#c1800b',
  '#beef00',
  '#ff0028',
  '#657a00',
  '#1400c6',
  '#7d3cff',
  '#f2d53c',
  '#c80e13',
  '#f2d53c',
  '#9bc400',
  '#f9c5bd',
  '#7c677f'
];

export const ICON_LIST = {
  application: {
    docx:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/doc.png',
    xlsx:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/excel.png',
    pptx:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/ppt.png',
    doc:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/doc.png',
    xls:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/excel.png',
    ppt:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/ppt.png',
    pdf:
      'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/pdf.png',
    csv: 'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/csv.png'
  },
  video:
    'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/Video.png',
  audio:
    'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/Audio.png',
  text: 'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/txt.png',
  other:
    'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/Other-file.png'
};

export const DATA_TYPES = {
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  UNDEFINED: 'undefined',
  FUNCTION: 'function'
};

export const DEFAULT_PRELOADED_IMAGE =
  '../../assets/img-placeholder/placeholder.gif';

export const EMAIL_BOOKMARKS = {
  addWorkflow: [
    {
      key: '{{firstName}}',
      value: 'First Name'
    },
    {
      key: '{{communityName}}',
      value: 'Community Name'
    },
    {
      key: '{{opportunityNumber}}',
      value: 'Opportunity Number'
    },
    {
      key: '{{postType}}',
      value: 'Post Type'
    },
    {
      key: '{{opportunityTitle}}',
      value: 'Opportunity Title'
    },
    {
      key: '{{opportunityDescription}}',
      value: 'Opportunity Description'
    },
    {
      key: '{{linkButton}}',
      value: 'Link Button'
    },
    {
      key: '{{currentWorkflowTitle}}',
      value: 'Current Workflow Title'
    },
    {
      key: '{{currentStageTitle}}',
      value: 'Current Stage Title'
    },
    {
      key: '{{currentStageDescription}}',
      value: 'Current Stage Description'
    },
    {
      key: '{{customMessage}}',
      value: 'Custom Message'
    }
  ],
  changeWorkflow: [
    {
      key: '{{firstName}}',
      value: 'First Name'
    },
    {
      key: '{{communityName}}',
      value: 'Community Name'
    },
    {
      key: '{{opportunityNumber}}',
      value: 'Opportunity Number'
    },
    {
      key: '{{postType}}',
      value: 'Post Type'
    },
    {
      key: '{{opportunityTitle}}',
      value: 'Opportunity Title'
    },
    {
      key: '{{opportunityDescription}}',
      value: 'Opportunity Description'
    },
    {
      key: '{{linkButton}}',
      value: 'Link Button'
    },
    {
      key: '{{currentWorkflowTitle}}',
      value: 'Current Workflow Title'
    },
    {
      key: '{{previousWorkflowTitle}}',
      value: 'Previous Workflow Title'
    },
    {
      key: '{{currentStageTitle}}',
      value: 'Current Stage Title'
    },
    {
      key: '{{previousStageTitle}}',
      value: 'Previous Stage Title'
    },
    {
      key: '{{currentStageDescription}}',
      value: 'Current Stage Description'
    },
    {
      key: '{{customMessage}}',
      value: 'Custom Message'
    }
  ],
  changeStage: [
    {
      key: '{{firstName}}',
      value: 'First Name'
    },
    {
      key: '{{communityName}}',
      value: 'Community Name'
    },
    {
      key: '{{opportunityNumber}}',
      value: 'Opportunity Number'
    },
    {
      key: '{{postType}}',
      value: 'Post Type'
    },
    {
      key: '{{opportunityTitle}}',
      value: 'Opportunity Title'
    },
    {
      key: '{{opportunityDescription}}',
      value: 'Opportunity Description'
    },
    {
      key: '{{linkButton}}',
      value: 'Link Button'
    },
    {
      key: '{{currentStageTitle}}',
      value: 'Current Stage Title'
    },
    {
      key: '{{previousStageTitle}}',
      value: 'Previous Stage Title'
    },
    {
      key: '{{currentStageDescription}}',
      value: 'Current Stage Description'
    },
    {
      key: '{{customMessage}}',
      value: 'Custom Message'
    }
  ],
  default: [
    {
      key: '{{firstName}}',
      value: 'First Name'
    },
    {
      key: '{{communityName}}',
      value: 'Community Name'
    },
    {
      key: '{{opportunityNumber}}',
      value: 'Opportunity Number'
    },
    {
      key: '{{postType}}',
      value: 'Post Type'
    },
    {
      key: '{{opportunityTitle}}',
      value: 'Opportunity Title'
    },
    {
      key: '{{opportunityDescription}}',
      value: 'Opportunity Description'
    },
    {
      key: '{{linkButton}}',
      value: 'Link Button'
    }
  ],
  updates: [
    {
      key: '{{communityName}}',
      value: 'Community Name'
    },
    {
      key: '{{updateTitle}}',
      value: 'Update Title'
    },
    {
      key: '{{updateMessage}}',
      value: 'Update Message'
    },
    {
      key: '{{viewUpdatesBtn}}',
      value: 'View Update(s) Link'
    },
    {
      key: '{{viewChallengeOpportunityBtn}}',
      value: 'View Challenge / Opportunity Link'
    }
  ]
};

export const REGEX = {
  commaSeparatedEmails:
    '^([ ]*[a-zA-Z0-9_.]+@([a-zA-Z0-9_]+[.])+[a-zA-Z0-9_]+[ ]*,?)+$',
  bit: '^[01]$',
  number: '^[0-9]+$',
  date: '(0[1-9]|1[012])[/](0[1-9]|[12][0-9]|3[01])[/][0-9]{4}$',
  numberWithComma: '^[0-9., ]+$',
  text: '^[a-zA-Z0-9_ ]*$',
  // tslint:disable-next-line: max-line-length
  email:
    "^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
  limitCharacters: (min: number, max: number) => {
    return `^[\\s\\S]{${min},${max}}$`;
  }
};

const opportunity = [
  {
    key: 'title',
    label: 'Title',
    validators: [
      {
        validate: 'required',
        error: 'This is a required field'
      },
      {
        validate: 'regex_matches',
        regex: REGEX.limitCharacters(0, 250),
        error: 'Text length is greater than 250'
      }
    ]
  },
  {
    key: 'description',
    label: 'Description',
    validators: [
      {
        validate: 'regex_matches',
        regex: REGEX.limitCharacters(0, 5000),
        error: 'Text length is greater than 5000'
      }
    ]
  },
  /* {
    key: 'opportunityType',
    label: 'Opportunity Type',
    validators: [
      {
        validate: 'required',
        error: 'This is a required field'
      },
      {
        validate: 'regex_matches',
        regex: REGEX.text,
        error: 'Only text allowed'
      }
    ]
  }, */
  {
    key: 'owners',
    label: 'Owners',
    validators: [
      {
        validate: 'regex_matches',
        regex: REGEX.commaSeparatedEmails,
        error: 'Must be valid Email(s)'
      }
    ]
  },
  {
    key: 'submitters',
    label: 'Submitters',
    validators: [
      {
        validate: 'regex_matches',
        regex: REGEX.commaSeparatedEmails,
        error: 'Must be valid Email(s)'
      }
    ]
  },
  {
    key: 'contributors',
    label: 'Team Members',
    validators: [
      {
        validate: 'regex_matches',
        regex: REGEX.commaSeparatedEmails,
        error: 'Must be valid Email(s)'
      }
    ]
  },
  {
    key: 'anonymous',
    label: 'Anonymous',
    validators: [
      {
        validate: 'regex_matches',
        regex: REGEX.bit,
        error: 'Only 0 or 1 allowed'
      }
    ]
  }
];

export const SCHEMAS = {
  opportunity
};

export const IMPORT_TYPES = {
  opportunity: {
    key: 'opportunity',
    title: 'Ideas',
    icon: 'lightbulb-on'
  },
  knowledge: {
    key: 'knowledge',
    title: 'Knowledge',
    icon: 'atom'
  },
  user: {
    key: 'user',
    title: 'Users',
    icon: 'user'
  }
};

export const SEARCH_RESULT_TYPE_ENUM = {
  OPPORTUNITY: 'opportunity',
  CHALLENGE: 'challenge',
  SOLUTION: 'Solution',
  USER: 'user',
  TAG: 'tag'
};

export const PIE_CHART_DATA_POINTS = {
  opportunityType: 'Opportunity Type',
  submitter: 'Submitter & Co-submitters',
  owner: 'Owner',
  currentlyAssigned: 'Currently assigned'
};

export const GADGET_TYPES = {
  PIE: {
    type: 'Pie',
    title: 'Pie Chart',
    icon: 'chart-pie'
  },
  // BAR: {
  //   type: 'Bar',
  //   title: 'Bar Chart',
  //   icon: 'chart-bar'
  // },
  TIME_SERIES: {
    type: 'TimeSeries',
    title: 'Time Series',
    icon: 'chart-line'
  },
  BUBBLE: {
    type: 'Bubble',
    title: 'Bubble Chart',
    icon: 'chart-scatter'
  }
  // PIVOT: {
  //   type: 'Pivot',
  //   title: 'Pivot Table',
  //   icon: 'table'
  // },
  // AGGREGATED: {
  //   type: 'Aggregated',
  //   title: 'Aggregated Tiles',
  //   icon: 'chart-line'
  // }
};
export const PIE_CHART_CONFIG = {
  configData: {
    test: '1'
  },
  widgetType: 'Pie'
};

export const CHART_DATA_FREQUENCY = {
  DAILY: { type: 'daily', title: 'Daily' },
  WEEKLY: { type: 'weekly', title: 'Weekly' },
  MONTHLY: { type: 'monthly', title: 'Monthly' }
};

export const DATA_FREQUENCY_MONTHS = 3;

export const EXCLUDE_URL_401 = [
  '/auth/verify-login',
  '/auth/logout',
  '/auth/switch-user-community'
];

export const PRIMARY_COLORS = [
  { color: '#1ab394', 'hover-color': '#17a185' },
  { color: '#2980b9', 'hover-color': '#2472a4' },
  { color: '#e74c3c', 'hover-color': '#c0392b' },
  { color: '#2ecc71', 'hover-color': '#27ae60' },
  { color: '#9b59b6', 'hover-color': '#8e44ad' },
  { color: '#434343', 'hover-color': '#000000' },
  { color: '#f1c40f', 'hover-color': '#dab10d' },
  { color: '#e67e22', 'hover-color': '#d35400' },
  { color: '#4f9237', 'hover-color': '#457f30' },
  { color: '#384d60', 'hover-color': '#2f4050' },
  { color: '#E25928', 'hover-color': '#d44d1d' },
  { color: '#003399', 'hover-color': '#002d89' }
];
export enum SCREEN_TYPES {
  WEB,
  MOBILE,
  TABLET
}
export const SCREEN_SIZES = [
  {
    screen: SCREEN_TYPES.WEB,
    min: 700,
    max: null
  },
  {
    screen: SCREEN_TYPES.MOBILE,
    min: 150,
    max: 700
  }
];

export const BULK_UPDATE_TYPES = {
  ARCHIVE_IDEAS: 'ARCHIVE_IDEAS',
  OPPORTUNITY_SETTINGS: 'OPPORTUNITY_SETTINGS',
  USER_SETTINGS: 'USER_SETTINGS',
  CUSTOM_FIELDS: 'CUSTOM_FIELDS',
  CHANGE_STAGE: 'CHANGE_STAGE'
};

export const OPPORTUNITY_SETTINGS_TYPES = {
  VISIBILITY: 'VISIBILITY',
  COMMENTING: 'COMMENTING',
  VOTING: 'VOTING'
};

export const OPPORTUNITY_LINKAGE_RELATIONSHIPS = [
  {
    title: 'Relates To',
    key: 'related_to'
  },
  {
    title: 'Duplicates',
    key: 'duplicates'
  },
  {
    title: 'Is Duplicated By',
    key: 'is_duplicated_by'
  },
  {
    title: 'Alternative To',
    key: 'alternative_to'
  },
  {
    title: 'Blocks',
    key: 'blocks'
  },
  {
    title: 'Is Blocked By',
    key: 'is_blocked_by'
  },
  {
    title: 'Has Synergies With',
    key: 'has_synergies_with'
  }
];

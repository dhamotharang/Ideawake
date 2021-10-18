import { TemplateRef } from '@angular/core';

export interface CommunityAppearance {
  defaultLogo: string;
  mobileLogo: string;
  favicon: string;
  emailFeaturedImage: string;
  primaryColor: string;
  accentColor: string;
  navigationBackgroundColor: string;
  navigationTextColor: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  jumbotronPageTitle: string;
  jumbotronBackgroundImage: string;
  jumbotronPageDescription: string;
}

export interface ChallengeSettings {
  visibility: {};
  allowVoting: boolean;
  allowCommenting: boolean;
  allowSharing: boolean;
  challengeLeaderboard: boolean;
  allowAnonymousIdea: boolean;
  allowAnonymousComment: boolean;
  defaultAnonymousSubmissions: boolean;
  defaultAnonymousComments: boolean;
  defaultAnonymousVotes: boolean;
  allowSubmissions: boolean;
  displayAlert: boolean;
  defaultSort: string;
  allowAnonymousVote: true;
  allowOpportunityOwnership: false;
  assignOpportunitySubmitterAsOwner: false;
  allowOpportunityTeams: false;
  allowTeamBasedOpportunity: false;
  assignOpportunitySubmitterAsContributor: false;
  assignMergedContributorsToParent: false;
  allowOpportunityCosubmitters: false;
  assignMergedCosubmittersToParent: false;
}

export interface HistoryData {
  date: Date;
  from: string;
  to: string;
  user: any;
}

export interface Notifications {
  today: {
    data: Array<any>;
    users: any;
  };
  past: {
    data: Array<any>;
    users: any;
  };
}

export interface SelectFieldDataInput {
  type: string;
  data: Array<{
    value: string;
    label: string;
    order: number;
  }>;
}

export interface DatepickerFieldInput {
  type: string;
  data: {};
}

export interface UserFieldInput {
  type: string;
  data: {
    isPreselected: boolean;
    users: Array<number>;
    groups: Array<number>;
  };
}

export interface NumberFieldInput {
  type: string;
  data: {
    format: string; // Will be either 'formatted_number' or 'unformatted_number'
    prefix: string;
    suffix: string;
  };
}
export interface DisplayOptions {
  webRender: boolean;
  mobileRender: boolean;
  display: boolean;
}
export interface TableColumnConfig {
  header: string;
  key: string;
  customCellTemplate?: TemplateRef<any>;
}
export interface TablePaginationConfig {
  take: number;
  skip: number;
  firstLoad: boolean;
}
export interface UsersOrGroupDropdownConfig {
  take: number;
  skip: number;
  searchSkip: number;
  userTotalCount: number;
  userSearchCount: number;
  groupSearchCount: number;
  groupTotalCount: number;
  searchText: string;
  isLoading: boolean;
  firstLoad: boolean;
}
export interface ExportIdeas {
  exportFormat: string;
  anonymizedExport: boolean;
  opportunityFilters: any;
}

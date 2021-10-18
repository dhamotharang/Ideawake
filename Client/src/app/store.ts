import { combineReducers } from 'redux';
import { tassign } from 'tassign';
import { keyBy, uniqBy } from 'lodash';
import { composeReducers, defaultFormReducer } from '@angular-redux/form';

import {
  CHANGE_CURRENT_COMMUNITY,
  CHANGE_USER,
  CLEAR_ALL_FILES,
  CLEAR_COMMUNITY_DATA,
  CLEAR_COMMUNITY_FORM_DATA,
  CLEAR_REGISTRATION_FORM_DATA,
  CLEAR_SELECTED_CHALLENGE_FILES,
  CLEAR_SELECTED_COMMENT_FILES,
  CLEAR_SELECTED_IDEA_FILES,
  CLEAR_SINGLE_FILE,
  CLEAR_USER_DATA,
  CLEAR_USER_PERMISSIONS,
  LOAD_ALL_FILES,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_COMMUNITY_DATA,
  LOAD_COMMUNITY_FORM_DATA,
  LOAD_REGISTRATION_FORM_DATA,
  LOAD_SELECTED_CHALLENGE_FILES,
  LOAD_SELECTED_COMMENT_FILES,
  LOAD_SELECTED_IDEA_FILES,
  LOAD_SINGLE_FILE,
  LOAD_USER_DATA,
  LOAD_USER_PERMISSIONS,
  SHOW_ACTIVITY_INDICATOR,
  FORM_SUBMISSION,
  OPPORTUNITY_FILTERS,
  CUSTOM_FIELD_FILTER_OUTPUT,
  CUSTOM_FIELD_FILTER_OUTPUT_BULK,
  LOAD_ALL_ENTITIES,
  CLEAR_ALL_ENTITIES,
  LOAD_SELECTED_POST_UPDATE_FILES,
  LOAD_UPDATE_AUDIENCE,
  CLEAR_SELECTED_POST_UPDATE_FILES,
  LOAD_DYNAMIC_TRANSLATION,
  UPDATE_SELECTED_LIST,
  CLEAR_SELECTED_LIST,
  LOAD_SELECTED_FILTER,
  LOAD_SELECTED_COLUMN
} from './actions';

import { StorageService } from './services/storage/storage.service';

export interface RegistrationState {
  user: any;
}

export interface UserCommunity {
  communityName: string;
  communityUrl: string;
  description: string;
  visibility: string;
  isOpen: boolean;
  isSSO: boolean;
  lastLogin: string;
}

export interface CommunityRegisterState {
  userCommunity: UserCommunity;
}

export interface CommunityState {
  tenant: any;
  community: any;
  user: any;
}

export interface UserState {
  user: any;
  userCommunityPermissions: any;
  currentCommunityId: any;
}

export interface Files {
  ideaFiles: {
    selected: Array<any>;
  };
  commentFiles: {
    selected: Array<any>;
  };
  singleFile: {
    selected: Array<any>;
  };
  challengeFiles: {
    selected: Array<any>;
  };
  postUpdateFiles: {
    selected: Array<any>;
  };
  all: Array<any>;
}

export interface ActivityIndicatorState {
  activityIndicatorShown: boolean;
}

export interface FormSubmitted {
  latestSubmission: {
    opportunity: boolean;
    view: boolean;
  };
}

export interface CommunitySettings {
  communityAppearance: {
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
  };
}

export interface Entities {
  entities: Array<any>;
}

export const INITIAL_DYNAMIC_TRANSLATION: dynamicTranslation = {
  settings: {
    language: 'en',
    isDynamicTranslation: false
  }
};

export interface dynamicTranslation {
  settings: {
    language: string;
    isDynamicTranslation: boolean;
  };
}

export interface IdeasState {
  list: {
    selected: Array<number>;
  };
}

export interface AppState {
  registrationState: RegistrationState;
  communityRegisterState: CommunityRegisterState;
  communityState: CommunityState;
  userState: UserState;
  filesState: Files;
  activityIndicatorState: ActivityIndicatorState;
  formSubmitted: FormSubmitted;
  communitySettingsState: CommunitySettings;
  entitiesState: Entities;
  DynamicTranslationState: dynamicTranslation;
  ideasState: IdeasState;
  filterState: FiltersState;
  columnState: ColumnsState;
}

export const ACTIVITY_INDICATOR_INITIAL_STATE: ActivityIndicatorState = {
  activityIndicatorShown: false
};

export const INITIAL_COLUMN_STATE: ColumnsState = {
  list: {
    selected: []
  }
};

export interface ColumnsState {
  list: {
    selected: Array<number>;
  };
}

export const INITIAL_USER_STATE = {
  user: {},
  userCommunityPermissions: {},
  currentCommunityId: ''
};

export const INITIAL_REGISTER_STATE: RegistrationState = {
  user: {
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    defaultLanguage: '',
    password: '',
    role: '',
    lastLogin: '',
    isSSO: false
  }
};

export const INITIAL_COMMUNITY_FORM_STATE: CommunityRegisterState = {
  userCommunity: {
    communityName: '',
    communityUrl: '',
    description: 'HELLO',
    visibility: 'Private',
    isOpen: true,
    isSSO: true,
    lastLogin: new Date().toDateString()
  }
};

export const INITIAL_COMMUNITY_STATE: CommunityState = {
  tenant: {},
  community: {},
  user: {}
};

export const INITIAL_FILES_STATE: Files = {
  ideaFiles: {
    selected: []
  },
  commentFiles: {
    selected: []
  },
  singleFile: {
    selected: []
  },
  challengeFiles: {
    selected: []
  },
  postUpdateFiles: {
    selected: []
  },
  all: []
};

export const INITIAL_COMMUNITY_SETTINGS_STATE: CommunitySettings = {
  communityAppearance: {
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
    jumbotronPageTitle: 'Test Title',
    jumbotronBackgroundImage: '',
    jumbotronPageDescription: 'Test Description'
  }
};

export const INITIAL_ENTITIES_STATE: Entities = {
  entities: []
};

export const FORM_SUBMITTED: FormSubmitted = {
  latestSubmission: {
    opportunity: false,
    view: false
  }
};

export const INITIAL_IDEAS_STATE: IdeasState = {
  list: {
    selected: []
  }
};

export const INITIAL_FILTER_STATE: FiltersState = {
  list: {
    selected: []
  }
};

export interface FiltersState {
  list: {
    selected: Array<number>;
  };
}

export const INITIAL_APP_STATE: AppState = {
  registrationState: INITIAL_REGISTER_STATE,
  communityRegisterState: INITIAL_COMMUNITY_FORM_STATE,
  communityState: INITIAL_COMMUNITY_STATE,
  userState: INITIAL_USER_STATE,
  filesState: INITIAL_FILES_STATE,
  activityIndicatorState: ACTIVITY_INDICATOR_INITIAL_STATE,
  formSubmitted: FORM_SUBMITTED,
  communitySettingsState: INITIAL_COMMUNITY_SETTINGS_STATE,
  entitiesState: INITIAL_ENTITIES_STATE,
  DynamicTranslationState: INITIAL_DYNAMIC_TRANSLATION,
  ideasState: INITIAL_IDEAS_STATE,
  filterState: INITIAL_FILTER_STATE,
  columnState: INITIAL_COLUMN_STATE
};

export const INITIAL_UPDATE_AUDIENCE: UpdateAudience = {
  targeting: {
    individuals: [],
    groups: [],
    allCommunityUsers: false,
    admins: false,
    moderators: false,
    challengeAdmins: false,
    challengeModerators: false,
    challengeParticipants: false,
    opportunityOwners: false,
    opportunityTeam: false,
    opportunitySubmitters: false,
    followers: false,
    voters: false,
    actionItemRelated: {
      allOpenItemsStages: false,
      openItemsStages: [],
      allPastDueStages: false,
      openPastDueStages: []
    }
  }
};

export interface UpdateAudience {
  targeting: {
    individuals: Array<any>;
    groups: Array<any>;
    allCommunityUsers: boolean;
    admins: boolean;
    moderators: boolean;
    challengeAdmins: boolean;
    challengeModerators: boolean;
    challengeParticipants: boolean;
    opportunityOwners: boolean;
    opportunityTeam: boolean;
    opportunitySubmitters: boolean;
    followers: boolean;
    voters: boolean;
    actionItemRelated: {
      allOpenItemsStages: boolean;
      openItemsStages: Array<any>;
      allPastDueStages: boolean;
      openPastDueStages: Array<any>;
    };
  };
}

const registerReducer = (
  state: RegistrationState = INITIAL_REGISTER_STATE,
  action
): RegistrationState => {
  switch (action.type) {
    case LOAD_REGISTRATION_FORM_DATA:
      return tassign(state, { ...{ user: action.user } });

    case CLEAR_REGISTRATION_FORM_DATA:
      return state;
  }
  return state;
};

const communityRegisterReducer = (
  state: CommunityRegisterState,
  action
): CommunityRegisterState => {
  switch (action.type) {
    case LOAD_COMMUNITY_FORM_DATA:
      return tassign(state, { ...{ userCommunity: action.userCommunity } });
    case CLEAR_COMMUNITY_FORM_DATA:
      return state;
  }

  return INITIAL_COMMUNITY_FORM_STATE;
};

const communityReducer = (state: CommunityState, action): CommunityState => {
  switch (action.type) {
    case LOAD_COMMUNITY_DATA:
      return tassign(state, action.community);
    case CLEAR_COMMUNITY_DATA:
      return INITIAL_COMMUNITY_STATE;
  }
  return INITIAL_COMMUNITY_STATE;
};

const userReducer = (
  state: UserState = INITIAL_USER_STATE,
  action
): UserState => {
  const storage = new StorageService();
  switch (action.type) {
    case LOAD_USER_DATA:
      storage.setItem('currentUser', action.user);
      storage.setItem('currentUserId', action.user.id);
      return tassign(state, { ...{ user: action.user } });
    case CLEAR_USER_DATA:
      storage.clearAll();
      return { ...INITIAL_USER_STATE };
    case CHANGE_USER:
      storage.setItem('currentUser', action.user);
      return tassign(state, { ...{ user: action.user } });
    case CHANGE_CURRENT_COMMUNITY:
      storage.setItem('selectedCommunity', action.currentCommunityId);
      return tassign(state, {
        ...{ currentCommunityId: action.currentCommunityId }
      });

    case LOAD_USER_PERMISSIONS:
      storage.setItem('communityPermissions', action.userCommunityPermissions);
      return tassign(state, {
        ...{
          userCommunityPermissions: action.userCommunityPermissions
        }
      });

    case CLEAR_USER_PERMISSIONS:
      storage.clearItem('communityPermissions');
      return tassign(state, {
        ...{ userCommunityPermissions: {} }
      });
  }

  return state;
};

const filesReducer = (state: Files = INITIAL_FILES_STATE, action): Files => {
  switch (action.type) {
    case LOAD_ALL_FILES:
      return tassign(state, {
        ...{ all: removeDuplicateFiles(action.all) }
      });

    case CLEAR_ALL_FILES:
      return tassign(state, {
        ...{ all: [] }
      });

    case LOAD_SELECTED_IDEA_FILES:
      return tassign(state, {
        ideaFiles: { selected: removeDuplicateFiles(action.selected) }
      });

    case CLEAR_SELECTED_IDEA_FILES:
      return tassign(state, {
        ideaFiles: { selected: [] }
      });

    case LOAD_SELECTED_COMMENT_FILES:
      return tassign(state, {
        commentFiles: { selected: removeDuplicateFiles(action.selected) }
      });

    case CLEAR_SELECTED_COMMENT_FILES:
      return tassign(state, {
        commentFiles: { selected: [] }
      });

    case LOAD_SELECTED_CHALLENGE_FILES:
      return tassign(state, {
        challengeFiles: { selected: removeDuplicateFiles(action.selected) }
      });

    case LOAD_SELECTED_POST_UPDATE_FILES:
      return tassign(state, {
        postUpdateFiles: { selected: removeDuplicateFiles(action.selected) }
      });

    case CLEAR_SELECTED_CHALLENGE_FILES:
      return tassign(state, {
        challengeFiles: { selected: [] }
      });

    case CLEAR_SELECTED_POST_UPDATE_FILES:
      return tassign(state, {
        postUpdateFiles: { selected: [] }
      });

    case LOAD_SINGLE_FILE:
      return tassign(state, {
        singleFile: { selected: removeDuplicateFiles(action.selected) }
      });

    case CLEAR_SINGLE_FILE:
      return tassign(state, {
        singleFile: { selected: [] }
      });
    default:
      break;
  }
  return state;
};

const removeDuplicateFiles = (files) => {
  return uniqBy(files, (file) => file.id);
};

const activityIndicatorReducer = (
  state: ActivityIndicatorState = ACTIVITY_INDICATOR_INITIAL_STATE,
  action
): ActivityIndicatorState => {
  switch (action.type) {
    case SHOW_ACTIVITY_INDICATOR: {
      return tassign(state, {
        ...{ activityIndicatorShown: action.indicator }
      });
    }
    default: {
      return state;
    }
  }
};

const formSubmissionReducer = (
  state: FormSubmitted = FORM_SUBMITTED,
  action
): FormSubmitted => {
  switch (action.type) {
    case FORM_SUBMISSION: {
      return tassign(state, {
        ...{ latestSubmission: action.latestSubmission }
      });
    }
    default: {
      return state;
    }
  }
};

const opportunityFiltersReducer = (state = { list: [] }, action) => {
  switch (action.type) {
    case OPPORTUNITY_FILTERS: {
      return tassign(state, {
        ...{ list: action.list }
      });
    }
    default: {
      return state;
    }
  }
};

const customFieldFilterOutputReducer = (
  state = { list: {}, emit: false },
  action
) => {
  switch (action.type) {
    case CUSTOM_FIELD_FILTER_OUTPUT: {
      if (action.data && action.data.customField) {
        state.list[action.data.customField] = action.data;
      } else {
        state.list[action.index] = {};
      }
      return tassign(state, {
        ...{ list: state.list, emit: action.emit }
      });
    }
    case CUSTOM_FIELD_FILTER_OUTPUT_BULK: {
      state.list = keyBy(action.data, 'customField');
      return tassign(state, {
        ...{ list: state.list, emit: false }
      });
    }
    default: {
      return state;
    }
  }
};

const communitySettingsReducer = (
  state: CommunitySettings = INITIAL_COMMUNITY_SETTINGS_STATE,
  action
) => {
  const storage = new StorageService();
  switch (action.type) {
    case LOAD_COMMUNITY_APPEARANCE_SETTINGS: {
      if (!action.communityAppearance) {
        action.communityAppearance =
          INITIAL_COMMUNITY_SETTINGS_STATE.communityAppearance;
      }
      storage.setItem('communityAppearance', action.communityAppearance);
      return tassign(state, {
        ...{ communityAppearance: action.communityAppearance }
      });
    }
    default: {
      return state;
    }
  }
};

const EntityReducer = (state: Entities = INITIAL_ENTITIES_STATE, action) => {
  const storage = new StorageService();
  switch (action.type) {
    case LOAD_ALL_ENTITIES:
      storage.setItem('entities', action.entities);
      return tassign(state, {
        ...{ entities: action.entities }
      });

    case CLEAR_ALL_ENTITIES:
      return tassign(state, {
        ...{ entities: action.entities }
      });
    default: {
      return state;
    }
  }
};

const UpdateAudienceReducer = (
  state: UpdateAudience = INITIAL_UPDATE_AUDIENCE,
  action
) => {
  switch (action.type) {
    case LOAD_UPDATE_AUDIENCE:
      return tassign(state, {
        ...{ targeting: action.targeting }
      });

    default: {
      return state;
    }
  }
};

const DynamicTranslationReducer = (
  state: dynamicTranslation = INITIAL_DYNAMIC_TRANSLATION,
  action
) => {
  switch (action.type) {
    case LOAD_DYNAMIC_TRANSLATION:
      return tassign(state, {
        ...{ settings: action.settings }
      });

    default: {
      return state;
    }
  }
};

const ideasReducer = (state: IdeasState = INITIAL_IDEAS_STATE, action) => {
  switch (action.type) {
    case UPDATE_SELECTED_LIST:
      return tassign(state, {
        list: { selected: action.selected }
      });

    case CLEAR_SELECTED_LIST:
      return tassign(state, {
        list: { selected: [] }
      });

    default: {
      return state;
    }
  }
};

export const filterReducer = (
  state: FiltersState = INITIAL_FILTER_STATE,
  action
) => {
  switch (action.type) {
    case LOAD_SELECTED_FILTER:
      return tassign(state, {
        list: { selected: action.selected }
      });
    default: {
      return state;
    }
  }
};

export const columnReducer = (
  state: ColumnsState = INITIAL_COLUMN_STATE,
  action
) => {
  switch (action.type) {
    case LOAD_SELECTED_COLUMN:
      return tassign(state, {
        list: { selected: action.selected }
      });
    default: {
      return state;
    }
  }
};

export const rootReducer = composeReducers(
  defaultFormReducer(),
  combineReducers({
    registrationState: registerReducer,
    communityRegisterState: communityRegisterReducer,
    communityState: communityReducer,
    userState: userReducer,
    filesState: filesReducer,
    activityIndicatorState: activityIndicatorReducer,
    communitySettingsState: communitySettingsReducer,
    formSubmitted: formSubmissionReducer,
    opportunityFilters: opportunityFiltersReducer,
    customFieldFilterOutput: customFieldFilterOutputReducer,
    entitiesState: EntityReducer,
    UpdateAudienceState: UpdateAudienceReducer,
    DynamicTranslationState: DynamicTranslationReducer,
    ideasState: ideasReducer,
    filterState: filterReducer,
    columnState: columnReducer
  })
);

export const creator = (f) => {
  if (f === 'comment') {
    return LOAD_SELECTED_COMMENT_FILES;
  } else if (f === 'idea') {
    return LOAD_SELECTED_IDEA_FILES;
  } else if (f === 'challenge') {
    return LOAD_SELECTED_CHALLENGE_FILES;
  } else if (f === 'postUpdate') {
    return LOAD_SELECTED_POST_UPDATE_FILES;
  }
};

export const STATE_TYPES = {
  registrationState: 'registrationState',
  communityRegisterState: 'communityRegisterState',
  communityState: 'communityState',
  userState: 'userState',
  filesState: 'filesState',
  activityIndicatorState: 'activityIndicatorState',
  communitySettingsState: 'communitySettingsState',
  formSubmitted: 'formSubmitted',
  opportunityFilters: 'opportunityFilters',
  customFieldFilterOutput: 'customFieldFilterOutput',
  entitiesState: 'entitiesState',
  UpdateAudienceState: 'UpdateAudienceState',
  DynamicTranslationState: 'DynamicTranslationState'
};

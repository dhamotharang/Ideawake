'use strict';

export interface CommunityUserGroupFieldInterface {
  type: string; // Will be 'community_user_or_group'
  data: {
    isPreselected: boolean; // Preselect responses or not.
    users: Array<number>; // Will be array of either user ids. It'll be empty if preselect responses option is not selected or no user selected
    groups: Array<number>; // Will be array of either group ids. It'll be empty if preselect responses option is not selected or no group selected
  };
}

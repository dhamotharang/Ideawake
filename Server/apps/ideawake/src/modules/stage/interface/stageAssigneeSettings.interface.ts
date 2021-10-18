export interface StageAssigneeSettingsInterface {
  allMembers?: boolean;
  unassigned?: boolean;
  groups?: Array<{}>;
  individuals?: Array<{}>;
  communityAdmins?: boolean;
  communityModerators?: boolean;
  communityUsers?: boolean;
  opportunityOwners?: boolean;
  opportunityTeams?: boolean;
  opportunitySubmitters?: boolean;
  customFieldAssignee?: {};
}

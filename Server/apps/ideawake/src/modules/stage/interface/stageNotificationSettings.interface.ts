export interface StageNotificationSettingsInterface {
  groups?: Array<{}>;
  individuals?: Array<{}>;
  opportunityOwners?: boolean;
  opportunityTeams?: boolean;
  opportunitySubmitters?: boolean;
  followers?: boolean;
  voters?: boolean;
  message?: string;
  sendEmail?: boolean;
}

import { StageAssigneeSettingsEntity } from '../../stage/stageAssigneeSettings.entity';

export interface AssigneeSummaryInterface {
  assigneeText: string;
  settings: StageAssigneeSettingsEntity;
  rawTexts: string[];
}

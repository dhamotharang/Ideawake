import { first, keys, map, uniq, values } from 'lodash';

import { Component, Input, OnChanges } from '@angular/core';

import { ProfileApiService } from '../../../../services';
import { CUSTOM_FIELD_TYPES, HistoryData } from '../../../../utils';

@Component({
  selector: 'app-field-history',
  templateUrl: './field-history.component.html',
  styleUrls: ['./field-history.component.scss'],
  providers: [ProfileApiService]
})
export class FieldHistoryComponent implements OnChanges {
  @Input() customField;
  @Input() dataType;

  constructor(private profileApi: ProfileApiService) {}

  viewHistory = false;

  fieldTypes = CUSTOM_FIELD_TYPES;
  editDates;
  editData;

  historyData: Array<HistoryData> = [
    {
      date: null,
      from: null,
      to: null,
      user: {
        firstName: null,
        lastName: null
      }
    }
  ];

  ngOnChanges() {
    if (
      first(this.customField.opportunityFieldData) &&
      first(this.customField.opportunityFieldData).history
    ) {
      this.editDates = keys(
        first(this.customField.opportunityFieldData).history
      );
      this.editData = values(
        first(this.customField.opportunityFieldData).history
      );
      this.getUsersData(uniq(map(this.editData, (d) => d.to.userId)));
    }
  }

  getUsersData(userIds) {
    this.profileApi.getBulkUsersData(userIds).subscribe((res: any) => {
      const allUsers = res.response;
      this.historyData = map(this.editData, (d, i) => ({
        date: new Date(this.editDates[i]),
        to: d.to[this.dataType],
        from: d.from[this.dataType],
        user: allUsers[d.to.userId]
      }));
    });
  }
}

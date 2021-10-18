import * as _ from 'lodash';

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { CUSTOM_FIELD_EXPERIENCE_ROLES } from '../../../../utils';

@Component({
  selector: 'app-field-access-badges',
  templateUrl: './field-access-badges.component.html',
  styleUrls: ['./field-access-badges.component.scss']
})
export class FieldAccessBadgesComponent implements OnChanges {
  @Input() customField;
  @Input() roles;

  experienceRoles = CUSTOM_FIELD_EXPERIENCE_ROLES;
  badges = ['Team', 'Owners', 'Moderators', 'Public'];

  public editRoles = [];
  public visibilityRoles = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'roles':
            if (this.roles) {
              this.populateRolesArray(
                this.customField.editRoles,
                this.editRoles
              );
              this.populateRolesArray(
                this.customField.visibilityRoles,
                this.visibilityRoles
              );
            }
            break;
          default:
            break;
        }
      }
    }
  }

  populateRolesArray(customFieldRoles, rolesArr) {
    if (customFieldRoles.length === 0) {
      rolesArr = _.cloneDeep(this.roles);
      rolesArr.push({
        abbreviation: 'all'
      });
    } else {
      _.forEach(customFieldRoles, (c) => {
        rolesArr.push(_.find(this.roles, (r) => r.id === c));
      });
    }
  }
}

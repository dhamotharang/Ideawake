import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { IMPORT_TYPES, SCHEMAS, REGEX } from 'src/app/utils';
import { AppState } from '../../../../store';
import FlatfileImporter from '@flatfile/adapter';
import { NgRedux } from '@angular-redux/store';
import {
  SharedApi,
  OpportunityApiService,
  CustomFieldApiService
} from '../../../../services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  private importer: FlatfileImporter;
  importSchemas = _.cloneDeep(SCHEMAS);
  customFields = [];
  opportunityTypes = [];
  disableButton;
  importTypes = IMPORT_TYPES;
  selectedType = this.importTypes.opportunity.key;
  selectedOpportunity = null;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    private opportunityApi: OpportunityApiService,
    private customFieldApi: CustomFieldApiService
  ) {}

  async ngOnInit() {
    this.getOpportunityTypes();
    await this.getCustomFields();
    this.setImportProps();
  }

  getOpportunityTypes() {
    this.opportunityApi
      .getOpportunityType({
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.opportunityTypes = res.response;
        this.selectedOpportunity = _.get(_.first(this.opportunityTypes), 'id');
      });
  }

  setImportProps() {
    this.disableButton = true;
    this.initializeImporter();
    this.setImportCustomer();
    this.disableButton = false;
  }

  async launchImporter() {
    if (!environment.flatFile.licenceKey) {
      return alert('NO LICENSE KEY CONFIGURED');
    }
    try {
      const results = await this.importer.requestDataFromUser();
      this.importer.displayLoader();
      try {
        await this.uploadData(results.validData);
        this.importer.displaySuccess('Success!');
        this.getCustomFields();
      } catch (e) {
        await this.importer.requestCorrectionsFromUser('Upload Failed');
      }
    } catch (e) {
      console.log(e || 'window close');
    }
  }

  private uploadData(data) {
    for (const datum of data) {
      datum.opportunityType = this.selectedOpportunity;
      datum.owners = _.map(_.split(datum.owners, ','), _.trim);
      datum.submitters = _.map(_.split(datum.submitters, ','), _.trim);
      datum.contributors = _.map(_.split(datum.contributors, ','), _.trim);
      datum.community = this.ngRedux.getState().userState.currentCommunityId;
    }
    return this.sharedApi.importBulkData(this.selectedType, data).toPromise();
  }

  private initializeImporter() {
    if (this.selectedType === IMPORT_TYPES.opportunity.key) {
      this.addCustomFieldToSchema();
    }
    if (this.importSchemas[this.selectedType]) {
      this.importer = new FlatfileImporter(environment.flatFile.licenceKey, {
        fields: this.importSchemas[this.selectedType],
        type: this.selectedType,
        allowInvalidSubmit: false,
        managed: false,
        allowCustom: true,
        disableManualInput: false
      });
    }
  }

  private setImportCustomer() {
    this.importer.setCustomer({
      userId: this.ngRedux.getState().userState.user.id,
      name: this.ngRedux.getState().userState.user.userName
    });
  }

  preserveOrder = () => 0;

  async getCustomFields() {
    const fields = _.get(
      await this.customFieldApi
        .getAllCustomFields({
          isDeleted: false,
          community: this.ngRedux.getState().userState.currentCommunityId
        })
        .toPromise(),
      'response'
    );
    this.customFields = _.filter(fields, (o) => {
      return _.includes(
        [
          'number',
          'single_line_text',
          'multi_line_text',
          'rich_text',
          'datepicker',
          'single_select',
          'multi_select'
        ],
        o.fieldDataObject.type
      );
    });
    this.addCustomFieldToSchema();
  }

  addCustomFieldToSchema() {
    const tempSchema = _.cloneDeep(SCHEMAS[IMPORT_TYPES.opportunity.key]);
    _.forEach(this.customFields, (value) => {
      let validation = [];
      // let type = undefined;
      // let options = undefined;
      if (_.get(value, 'fieldDataObject.type') === 'number') {
        validation = [
          {
            validate: 'regex_matches',
            regex: REGEX.numberWithComma,
            error: 'Must be a number'
          }
        ];
      } else if (
        _.get(value, 'fieldDataObject.type') === 'single_line_text' ||
        _.get(value, 'fieldDataObject.type') === 'multi_line_text'
      ) {
        validation = [
          {
            validate: 'regex_matches',
            regex: REGEX.limitCharacters(0, 99999),
            error: 'Must be a text field'
          }
        ];
      } else if (_.get(value, 'fieldDataObject.type') === 'datepicker') {
        validation = [
          {
            validate: 'regex_matches',
            regex: REGEX.date,
            error: 'Must be a date (mm/dd/yyyy)'
          }
        ];
      } /* else if (_.get(value, 'fieldDataObject.type') === 'single_select') {
        // type = 'select';
        // options = _.map(_.get(value, 'fieldDataObject.data', []), object => {
        //   return { value: object.value, label: object.label };
        // });
        const data = _.map(_.get(value, 'fieldDataObject.data', []), 'label');
        const dataString = _.join(data, '|');
        validation = [
          {
            validate: 'regex_matches',
            regex: `^(${dataString})[ ]*$`,
            regexFlags: { i: true },
            error: `Chose an option from these (${_.join(data, ', ')})`
          }
        ];
      } else if (_.get(value, 'fieldDataObject.type') === 'multi_select') {
        const data = _.map(_.get(value, 'fieldDataObject.data', []), 'label');
        const dataString = _.join(data, '|');
        validation = [
          {
            validate: 'regex_matches',
            regex: `^[${dataString} ,]*$`,
            regexFlags: { i: true },
            error: `Chose from these (${_.join(data, ', ')})`
          }
        ];
      } */
      tempSchema.push({
        key: value.uniqueId,
        label: value.title,
        ...(validation.length && { validators: validation })
        // ...(type && { type }),
        // ...(options && { options })
      });
    });
    this.importSchemas[IMPORT_TYPES.opportunity.key] = tempSchema;
  }
}

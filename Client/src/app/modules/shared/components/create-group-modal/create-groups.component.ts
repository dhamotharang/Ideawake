import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';

import {
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';

@Component({
  selector: 'app-create-groups',
  templateUrl: './create-groups.component.html',
  providers: [GroupsApiService],
  exportAs: 'modal'
  // styleUrls: ['../groups-list-container/groups-list-container.component.scss']
})
export class CreateGroupsComponent implements OnInit, OnDestroy {
  @Input() retdata;
  @Output() close1: EventEmitter<any> = new EventEmitter();

  public submitted = false;
  public parents = [];
  public dupeError = false;
  communityId;
  public pinToShortcuts;
  private sub: Subscription;

  public createGroupsForm = this.formBuilder.group({
    groups: this.formBuilder.array([]),
    pinToShortcuts: [false],
    parentGroup: [`${this.parents[0] || ''}`]
  });

  constructor(
    private formBuilder: FormBuilder,
    private groupsApiService: GroupsApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>,
    private shareService: ShareDataService
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.communityId = state.currentCommunityId;
        this.groups.push(this.formBuilder.control('', Validators.required));

        this.groupsApiService.getGroups().subscribe(
          (res: any) => {
            if (res.wasSuccess) {
              this.parents = res.response.data;
              this.parents.unshift({ name: 'None', id: '' });
              this.retdata
                ? this.createGroupsForm.controls[`parentGroup`].setValue(
                    this.retdata
                  )
                : this.createGroupsForm.controls[`parentGroup`].setValue(
                    this.parents[0].id
                  );
            }
          },
          (err) => this.notifier.showError('Something Went Wrong')
        );
      });
  }

  submitt(form) {
    let error = true;
    const data = {
      groups: [],
      pinToShortcut: form.value.pinToShortcuts,
      communityId: this.ngRedux.getState().userState.currentCommunityId
    };
    form.value.groups.forEach((email, i) => {
      if (email !== '') {
        data.groups.push({
          name: email,
          parentCircleId: form.value.parentGroup
        });
        error = false;
      }
    });
    const dupes = form.value.groups.filter((item, index) => {
      if (form.value.groups.indexOf(item) !== index && item) {
        return true;
      } else {
        return false;
      }
    });

    if (dupes.length) {
      this.dupeError = true;
      return;
    }
    if (error) {
      this.submitted = true;
      return;
    } else {
      const dupRows = [...this.shareService.rowsToPrint];
      this.shareService.rowsToPrint.splice(
        0,
        this.shareService.rowsToPrint.length
      );

      this.groupsApiService.addGroup(data).subscribe(
        (resp: any) => {
          dupRows.forEach((elem) => {
            this.shareService.pushRowsToPrint(elem);
          });
          if (resp.statusCode === 422) {
            this.notifier.showError(
              'This group exists already, please choose a different name for your group',
              {
                positionClass: 'toast-bottom-center'
              }
            );
          } else {
            this.notifier.showSuccess('Alerts.GroupsCreated', {
              positionClass: 'toast-bottom-center'
            });
            this.shareService.pushRowsToPrint({
              id: resp.response[0].id,
              name: resp.response[0].name,
              displayName: resp.response[0].displayName,
              users: resp.response[0].users,
              signupRate: resp.response[0].signupRate,
              childGroups: resp.response[0].childGroups,
              status: resp.response[0].isDeleted ? 'Archived' : 'Active'
            });
            this.close1.emit();
          }
        },
        (fail) => {
          dupRows.forEach((elem) => {
            this.shareService.pushRowsToPrint(elem);
          });
          this.notifier.showError('Server Error');
        }
      );
    }
  }

  closeModal() {
    this.close1.emit();
  }

  get groups() {
    return this.createGroupsForm.get('groups') as FormArray;
  }

  addGroup() {
    this.groups.push(this.formBuilder.control(''));
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}

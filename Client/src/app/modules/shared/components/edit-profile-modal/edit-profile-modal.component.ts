import { get } from 'lodash';
import {
  ApiService,
  NotificationService,
  ProfileApiService
} from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders
} from '@angular/common/http';

import { DEFAULT_PRELOADED_IMAGE, LANGUAGES } from '../../../../utils';
import { LOAD_USER_DATA } from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';
import { I18nService } from 'src/app/modules/i18n/i18n.service';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  providers: [ProfileApiService]
})
export class EditProfileModalComponent implements OnInit, OnDestroy {
  public languages = LANGUAGES;
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() retdata;
  @Output() close1: EventEmitter<any> = new EventEmitter();
  @Output() response: EventEmitter<any> = new EventEmitter();
  @Input() dismiss;
  currentUser = this.ngRedux.getState().userState;
  modalSkills;
  userSkills;
  hideErrorMessage = false;
  user;
  uploadProgress: number;
  upload: boolean;
  userImage;
  communityId;

  public editProfileForm: FormGroup = this.formBuilder.group({
    profileImage: [''],
    firstName: ['', Validators.required],
    lastName: [''],
    profileBio: [''],
    userName: [''],
    skills: [''],
    email: ['', Validators.required],
    country: [''],
    zipCode: [''],
    position: [''],
    company: [''],
    language: ['']
  });

  private sub: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private profileApiService: ProfileApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService,
    private i18nService: I18nService
  ) {}

  async ngOnInit() {
    this.profileApiService.getTags().subscribe((res: any) => {
      this.modalSkills = res.response;
    });

    this.user = await this.profileApiService
      .getUser(this.retdata)
      .toPromise()
      .then((res: any) => {
        return res.response[0];
      });

    this.firstName.setValue(this.user.firstName);
    this.lastName.setValue(this.user.lastName);
    this.profileBio.setValue(this.user.profileBio);
    this.userName.setValue(this.user.userName);
    this.skills.setValue([]);
    this.email.setValue(this.user.email);
    this.country.setValue(this.user.country);
    this.zipCode.setValue(this.user.zipCode);
    this.position.setValue(this.user.position);
    this.company.setValue(this.user.company);
    this.profileImage.setValue(
      this.user.profileImage ? this.user.profileImage.url : null
    );
    this.language.setValue(this.user.language);

    this.userImage = this.user.profileImage ? this.user.profileImage.url : null;
    this.userSkills = this.user.skillsData;

    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.communityId = state.currentCommunityId;
      });
  }

  get firstName() {
    return this.editProfileForm.get('firstName');
  }

  get lastName() {
    return this.editProfileForm.get('lastName');
  }

  get profileBio() {
    return this.editProfileForm.get('profileBio');
  }

  get userName() {
    return this.editProfileForm.get('userName');
  }

  get skills() {
    return this.editProfileForm.get('skills');
  }

  get email() {
    return this.editProfileForm.get('email');
  }

  get country() {
    return this.editProfileForm.get('country');
  }

  get zipCode() {
    return this.editProfileForm.get('zipCode');
  }

  get position() {
    return this.editProfileForm.get('position');
  }

  get company() {
    return this.editProfileForm.get('company');
  }
  get profileImage() {
    return this.editProfileForm.get('profileImage');
  }

  get language() {
    return this.editProfileForm.get('language');
  }

  uploadImage(fileList: File) {
    const file = fileList['0'];
    this.apiService
      .get(
        `/users/get-upload-url/?fileName=${file.name}&contentType=${file.type}`
      )
      .subscribe((res: any) => {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', file.type); // test! make sure headers are set in below put api

        this.apiService.s3Upload(res.response.urls, file, headers).subscribe(
          (event1: HttpEvent<any>) => {
            switch (event1.type) {
              case HttpEventType.Sent:
                this.upload = true;
                break;
              case HttpEventType.UploadProgress:
                this.uploadProgress = Math.round(
                  (event1.loaded / event1.total) * 100
                );
                break;
              case HttpEventType.Response:
                this.userImage =
                  res.response.bucketPath + res.response.fileName;
                this.notifier.showSuccess('Image uploaded successfully');
                this.upload = false;
                break;
            }
          },
          (err: HttpErrorResponse) => {
            this.uploadProgress = 0;
            this.notifier.showError('Something went wrong');
          }
        );
      });
  }

  onSubmit() {
    if (this.editProfileForm.invalid) {
      this.notifier.showError('fields with * are required');
      return;
    }
    this.hideErrorMessage = false;

    this.apiService
      .post('/user-attachment', {
        user: this.user.id,
        attachmentType: 'gif',
        url: this.userImage,
        community: this.communityId
      })
      .subscribe((res: any) => {
        this.profileImage.setValue(res.response.id);
        const data = this.editProfileForm.value;
        data.skills = data.skills || [];
        this.profileApiService
          .updateUser(this.retdata, data)
          .subscribe((res1: any) => {
            if (this.currentUser.user.id === parseInt(this.retdata, 10)) {
              this.ngRedux.dispatch({
                type: LOAD_USER_DATA,
                user: res1.response.user
              });
            } else {
              this.close1.emit({ reload: true });
            }
            this.notifier.showSuccess('Profile Updated');
            let language = localStorage.getItem('language');
            if (language !== get(this.language, 'value', 'en')) {
              this.i18nService.setLanguage(get(this.language, 'value', 'en'));
              location.reload();
            }
          });
      });
    this.close1.emit();
  }

  closeModal() {
    this.close1.emit();
  }

  data(selected: []) {
    this.skills.setValue(selected);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  search(param) {}
}

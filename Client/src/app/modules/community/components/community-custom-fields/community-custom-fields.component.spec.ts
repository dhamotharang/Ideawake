import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityCustomFieldsComponent } from './community-custom-fields.component';

describe('CommunityCustomFieldsComponent', () => {
  let component: CommunityCustomFieldsComponent;
  let fixture: ComponentFixture<CommunityCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityCustomFieldsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

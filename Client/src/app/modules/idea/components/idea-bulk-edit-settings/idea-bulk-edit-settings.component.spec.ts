import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaBulkEditSettingsComponent } from './idea-bulk-edit-settings.component';

describe('IdeaBulkEditSettingsComponent', () => {
  let component: IdeaBulkEditSettingsComponent;
  let fixture: ComponentFixture<IdeaBulkEditSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdeaBulkEditSettingsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaBulkEditSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

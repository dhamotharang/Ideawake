import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAttachCustomFieldListComponent } from './bulk-attach-custom-field-list.component';

describe('BulkAttachCustomFieldListComponent', () => {
  let component: BulkAttachCustomFieldListComponent;
  let fixture: ComponentFixture<BulkAttachCustomFieldListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BulkAttachCustomFieldListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkAttachCustomFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

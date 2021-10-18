import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDataTableComponent } from './custom-data-table.component';

describe('CustomDataTableComponent', () => {
  let component: CustomDataTableComponent;
  let fixture: ComponentFixture<CustomDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomDataTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

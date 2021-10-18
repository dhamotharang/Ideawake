import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveIdeaModalComponent } from './archive-idea-modal.component';

describe('ArchiveIdeaModalComponent', () => {
  let component: ArchiveIdeaModalComponent;
  let fixture: ComponentFixture<ArchiveIdeaModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveIdeaModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveIdeaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

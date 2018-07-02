import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobWizardComponent } from './job-wizard.component';

describe('JobWizardComponent', () => {
  let component: JobWizardComponent;
  let fixture: ComponentFixture<JobWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

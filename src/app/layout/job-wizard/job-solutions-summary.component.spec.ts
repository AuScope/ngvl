import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';

describe('JobSolutionsSummaryComponent', () => {
  let component: JobSolutionsSummaryComponent;
  let fixture: ComponentFixture<JobSolutionsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobSolutionsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobSolutionsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

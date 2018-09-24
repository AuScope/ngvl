import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDatasetsComponent } from './job-datasets.component';


describe('JobObjectComponent', () => {
  let component: JobDatasetsComponent;
  let fixture: ComponentFixture<JobDatasetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobDatasetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

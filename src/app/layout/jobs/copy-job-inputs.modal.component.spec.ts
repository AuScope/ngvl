import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyJobInputsModalContent } from './copy-job-inputs.modal.component';

describe('JobsComponent', () => {
  let component: CopyJobInputsModalContent;
  let fixture: ComponentFixture<CopyJobInputsModalContent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyJobInputsModalContent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyJobInputsModalContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

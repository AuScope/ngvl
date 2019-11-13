import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetsRecordComponent } from './datasets-record.component';

describe('DatasetsRecordComponent', () => {
  let component: DatasetsRecordComponent;
  let fixture: ComponentFixture<DatasetsRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetsRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetsRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

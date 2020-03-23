import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetsDisplayComponent } from './datasets-display.component';

describe('DatasetsDisplayComponent', () => {
  let component: DatasetsDisplayComponent;
  let fixture: ComponentFixture<DatasetsDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetsDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

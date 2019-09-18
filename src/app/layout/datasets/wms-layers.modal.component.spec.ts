import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WmsLayersModalComponent } from './wms-layers.modal.component';

describe('WmsLayersContent', () => {
  let component: WmsLayersModalComponent;
  let fixture: ComponentFixture<WmsLayersModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WmsLayersModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WmsLayersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

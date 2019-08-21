import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OlMapBasemapComponent } from './ol-map-basemap.component';

describe('OlMapBasemapComponent', () => {
  let component: OlMapBasemapComponent;
  let fixture: ComponentFixture<OlMapBasemapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OlMapBasemapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OlMapBasemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapZoomComponent } from './openlayermap/controls/olmap.zoom.component';
import { OlMapDataSelectComponent } from './openlayermap/controls/olmap.select.data.component';
import { OlMapLayersComponent } from './openlayermap/controls/olmap.layers.component';
import { OlMapComponent } from './openlayermap/olmap.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerHandlerService } from 'portal-core-ui/service/cswrecords/layer-handler.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PortalCoreModule } from 'portal-core-ui/portal-core.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DatasetsComponent', () => {
  let component: DatasetsComponent;
  let fixture: ComponentFixture<DatasetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetsComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapComponent ],
      imports: [ PageHeaderModule, NgbModule.forRoot(), HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule, PortalCoreModule.forRoot('../../../environments/environment.ts') ],
      providers: [ OlMapService, LayerHandlerService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

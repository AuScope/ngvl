import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SolutionsModule } from '../../solutions/solutions.module';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerHandlerService } from 'portal-core-ui/service/cswrecords/layer-handler.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserStateService } from '../../../shared';
import { CSWSearchService } from '../../../shared/services/csw-search.service';
import { PortalCoreModule } from 'portal-core-ui/portal-core.module';
import { VglService } from '../../../shared/modules/vgl/vgl.service';


describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarComponent ],
      imports: [ RouterTestingModule, TranslateModule.forRoot(), NgbModule.forRoot(), FormsModule, ReactiveFormsModule, SolutionsModule, PortalCoreModule.forRoot('../../../../environments/environment.ts') ],
      providers: [ OlMapService, LayerHandlerService, UserStateService, VglService, CSWSearchService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SolutionsBrowserComponent } from './solutions/solutions-browser/solutions-browser.component';
import { UserStateService } from '../shared';
import { VglService } from '../shared/modules/vgl/vgl.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerHandlerService } from 'portal-core-ui/service/cswrecords/layer-handler.service';
import { PortalCoreModule } from 'portal-core-ui/portal-core.module';
import { CSWSearchService } from '../shared/services/csw-search.service';

describe('LayoutComponent', () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [ LayoutComponent, HeaderComponent, SidebarComponent, SolutionsBrowserComponent ],
                imports: [ RouterTestingModule, TranslateModule.forRoot(),
                    NgbModule.forRoot(), FormsModule, ReactiveFormsModule,
                    HttpClientTestingModule, PortalCoreModule.forRoot('../../environments/environment.ts') ],
                providers: [ UserStateService, VglService, OlMapService, LayerHandlerService, CSWSearchService ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

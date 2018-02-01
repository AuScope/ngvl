import { environment } from '../../environments/environment';
import { PortalCoreModule } from '../shared/modules/portal-core-ui/portal-core.module';
import { KeysPipe } from '../shared/modules/portal-core-ui/uiutilities/pipes';
import { PortalCorePipesModule } from '../shared/modules/portal-core-ui/uiutilities/portal-core.pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
    imports: [
        PortalCorePipesModule,
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule.forRoot(),
        NgbCollapseModule.forRoot()
    ],
    declarations: [LayoutComponent, SidebarComponent, HeaderComponent]
})
export class LayoutModule {}

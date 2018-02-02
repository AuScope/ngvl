import { environment } from '../../environments/environment';
import { PortalCoreModule } from '../shared/modules/portal-core-ui/portal-core.module';
import { KeysPipe } from '../shared/modules/portal-core-ui/uiutilities/pipes';
import { PortalCorePipesModule } from '../shared/modules/portal-core-ui/uiutilities/portal-core.pipes.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { CSWSearchService } from '../shared/services/csw-search.service';


@NgModule({
    imports: [
        PortalCorePipesModule,
        CommonModule,
        FormsModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbModule.forRoot()
    ],
    declarations: [LayoutComponent, SidebarComponent, HeaderComponent],
    providers: [CSWSearchService]
})
export class LayoutModule {}

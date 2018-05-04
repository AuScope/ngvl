import { environment } from '../../environments/environment';
import { DatePickerComponent } from './bs-component/components/date-picker/date-picker.component';
import { PortalCoreModule } from 'portal-core-ui/portal-core.module';
import { KeysPipe } from 'portal-core-ui/uiutilities/pipes';
import { PortalCorePipesModule } from 'portal-core-ui/uiutilities/portal-core.pipes.module';
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
import { RecordModalContent } from './datasets/record.modal.component';
import { SolutionsModule } from './solutions/solutions.module';
import { DatasetsModule } from './datasets/datasets.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';


@NgModule({
    imports: [
        PortalCorePipesModule,
        CommonModule,
        FormsModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbModule.forRoot(),
        SolutionsModule,
        DatasetsModule,
        OverlayPanelModule
    ],
    declarations: [ LayoutComponent, SidebarComponent, HeaderComponent, RecordModalContent ],
    providers: [ CSWSearchService ],
    entryComponents: [ RecordModalContent ]
})
export class LayoutModule {}

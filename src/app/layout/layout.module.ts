import { PortalCorePipesModule } from '@auscope/portal-core-ui';
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
import { RecordModalComponent } from './datasets/record.modal.component';
import { SolutionsModule } from './solutions/solutions.module';
import { DatasetsModule } from './datasets/datasets.module';
import { JobsModule } from './jobs/jobs.module';
import { UserModule } from './user/user.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { JobWizardModule } from './job-wizard/job-wizard.module';
import { AngularSplitModule } from 'angular-split';


@NgModule({
  imports: [
    PortalCorePipesModule,
    CommonModule,
    FormsModule,
    LayoutRoutingModule,
    TranslateModule,
    NgbModule,
    AngularSplitModule.forRoot(),
    SolutionsModule,
    DatasetsModule,
    JobsModule,
    UserModule,
    OverlayPanelModule,
    JobWizardModule
  ],
  declarations: [
    LayoutComponent,
    SidebarComponent,
    HeaderComponent,
    RecordModalComponent ],
  providers: [ CSWSearchService ],
  entryComponents: [ RecordModalComponent ]
})
export class LayoutModule {}

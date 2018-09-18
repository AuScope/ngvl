import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapModule } from './openlayermap/olmap.module';
import { ConfirmDatasetsModalContent } from './confirm-datasets.modal.component';
import { DownloadOptionsModalContent } from './download-options.modal.component';
import { NgbCollapseModule, NgbModalModule, NgbTypeaheadModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { DropdownModule } from 'primeng/dropdown';
import { DatasetsDisplayComponent } from './datasets-display.component';
import { AngularSplitModule } from 'angular-split';
import { RemoteDatasetsModalContent } from './remote-datasets.modal.component';


@NgModule({
  imports: [
    AngularSplitModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    OlMapModule,
    CalendarModule,
    TableModule,    // Note: PrimeNG v6.0.0 needs this for TreeTable to display correctly
    TreeTableModule,
    DropdownModule,
    NgbCollapseModule.forRoot(),
    NgbModalModule.forRoot(),
    NgbTypeaheadModule.forRoot(),
    NgbTabsetModule.forRoot()
  ],
  declarations: [ DatasetsComponent, ConfirmDatasetsModalContent, DownloadOptionsModalContent, DatasetsDisplayComponent, RemoteDatasetsModalContent],
  entryComponents: [ ConfirmDatasetsModalContent, DownloadOptionsModalContent, RemoteDatasetsModalContent ]
})
export class DatasetsModule { }

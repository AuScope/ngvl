import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapModule } from './openlayermap/olmap.module';
import { ConfirmDatasetsModalContent } from './confirm-datasets.modal.component';
import { DownloadOptionsModalContent } from './download-options.modal.component';
import { NgbCollapseModule, NgbDatepickerModule, NgbModalModule, NgbTypeaheadModule,NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import {DropdownModule} from 'primeng/dropdown';
import { DatasetsDisplayComponent } from './datasets-display.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    OlMapModule,
    TableModule,    // Note: PrimeNG v6.0.0 needs this for TreeTable to display correctly
    TreeTableModule,
    DropdownModule,
    NgbCollapseModule.forRoot(),
    NgbDatepickerModule.forRoot(),
    NgbModalModule.forRoot(),
    NgbTypeaheadModule.forRoot(),
    NgbTabsetModule.forRoot()
  ],
  declarations: [ DatasetsComponent, ConfirmDatasetsModalContent, DownloadOptionsModalContent, DatasetsDisplayComponent],
  entryComponents: [ ConfirmDatasetsModalContent, DownloadOptionsModalContent ]
})
export class DatasetsModule { }

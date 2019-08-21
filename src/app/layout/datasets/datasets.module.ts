import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapModule } from './openlayermap/olmap.module';
import { ConfirmDatasetsModalComponent } from './confirm-datasets.modal.component';
import { DownloadOptionsModalComponent } from './download-options.modal.component';
import { NgbCollapseModule, NgbModalModule, NgbTypeaheadModule, NgbTabsetModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { DatasetsDisplayComponent } from './datasets-display.component';
import { AngularSplitModule } from 'angular-split';
import { RemoteDatasetsModalComponent } from './remote-datasets.modal.component';


@NgModule({
  imports: [
    AngularSplitModule.forRoot(),
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
    SliderModule,
    NgbCollapseModule.forRoot(),
    NgbDropdownModule.forRoot(),
    NgbModalModule.forRoot(),
    NgbTypeaheadModule.forRoot(),
    NgbTabsetModule.forRoot()
  ],
  declarations: [ DatasetsComponent, ConfirmDatasetsModalComponent, DownloadOptionsModalComponent, DatasetsDisplayComponent, RemoteDatasetsModalComponent],
  entryComponents: [ ConfirmDatasetsModalComponent, DownloadOptionsModalComponent, RemoteDatasetsModalComponent ]
})
export class DatasetsModule { }

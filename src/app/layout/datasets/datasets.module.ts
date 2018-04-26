import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapModule } from './openlayermap/olmap.module';
import { ConfirmDatasetsModalContent } from './confirm-datasets.modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TreeTableModule } from 'primeng/treetable';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    OlMapModule,
    TreeTableModule,
    NgbModule.forRoot()
  ],
  declarations: [DatasetsComponent, ConfirmDatasetsModalContent],
  entryComponents: [ConfirmDatasetsModalContent]
})
export class DatasetsModule { }

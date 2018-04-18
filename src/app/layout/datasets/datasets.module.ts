import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapModule } from './openlayermap/olmap.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    OlMapModule,
    NgbModule.forRoot()
  ],
  declarations: [DatasetsComponent],
})
export class DatasetsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapComponent } from './openlayermap/olmap.component';

@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule
  ],
  declarations: [DatasetsComponent, OlMapComponent],
  bootstrap: [OlMapComponent]
})
export class DatasetsModule { }

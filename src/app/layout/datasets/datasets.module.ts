import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';
import { OlMapComponent } from './openlayermap/olmap.component';

import { OlMapZoomComponent } from './openlayermap/olmap.zoom.component';
import { OlMapDataSelectComponent } from './openlayermap/olmap.select.data.component';


@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule
  ],
  declarations: [DatasetsComponent, OlMapComponent, OlMapZoomComponent, OlMapDataSelectComponent],
  bootstrap: [OlMapComponent, OlMapZoomComponent, OlMapDataSelectComponent]
})
export class DatasetsModule { }

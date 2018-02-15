import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';

import { OlMapComponent } from './openlayermap/olmap.component';
import { OlMapZoomComponent } from './openlayermap/olmap.zoom.component';
import { OlMapDataSelectComponent } from './openlayermap/olmap.select.data.component';
import { OlMapLayersComponent } from './openlayermap/olmap.layers.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    NgbModule.forRoot()
  ],
  declarations: [DatasetsComponent, OlMapComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent],
  bootstrap: [OlMapComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent]
})
export class DatasetsModule { }

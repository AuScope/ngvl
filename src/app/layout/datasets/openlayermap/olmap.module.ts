import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { OlMapComponent } from './olmap.component';
import { OlMapPreviewComponent } from './olmap.preview.component';
import { OlMapZoomComponent } from './controls/olmap.zoom.component';
import { OlMapDataSelectComponent } from './controls/olmap.select.data.component';
import { OlMapLayersComponent } from './controls/olmap.layers.component';
import { OlMapBoundariesComponent } from './controls/olmap.boundaries.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  imports: [
    CommonModule,
    NgbModule.forRoot(),
    ReactiveFormsModule
  ],
  declarations: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapBoundariesComponent ],
  bootstrap: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapBoundariesComponent ],
  exports: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapBoundariesComponent ]
})
export class OlMapModule { }

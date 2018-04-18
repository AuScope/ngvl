import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OlMapComponent } from './olmap.component';
import { OlMapPreviewComponent } from './olmap.preview.component';
import { OlMapZoomComponent } from './controls/olmap.zoom.component';
import { OlMapDataSelectComponent } from './controls/olmap.select.data.component';
import { OlMapLayersComponent } from './controls/olmap.layers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  imports: [
    CommonModule,
    NgbModule.forRoot()
  ],
  declarations: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent ],
  bootstrap: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent ],
  exports: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent ]
})
export class OlMapModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { OlMapComponent } from './olmap.component';
import { OlMapPreviewComponent } from './olmap.preview.component';
import { OlMapZoomComponent } from './controls/olmap.zoom.component';
import { OlMapDataSelectComponent } from './controls/olmap.select.data.component';
import { OlMapLayersComponent } from './controls/olmap.layers.component';
import { OlMapBoundariesComponent } from './controls/olmap.boundaries.component';
import { NgbAccordionModule, NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { OlMapBasemapComponent } from './controls/ol-map-basemap.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule } from 'primeng/slider';
import { DatasetsRecordModule } from '../datasets-record/datasets-record.module';


@NgModule({
  imports: [
    CommonModule,
    NgbAccordionModule.forRoot(),
    NgbCollapseModule.forRoot(),
    NgbDropdownModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    RadioButtonModule,
    SliderModule,
    DatasetsRecordModule
  ],
  declarations: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapBoundariesComponent, OlMapBasemapComponent ],
  bootstrap: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapBoundariesComponent, OlMapBasemapComponent ],
  exports: [ OlMapComponent, OlMapPreviewComponent, OlMapZoomComponent, OlMapDataSelectComponent, OlMapLayersComponent, OlMapBoundariesComponent, OlMapBasemapComponent ]
})
export class OlMapModule { }

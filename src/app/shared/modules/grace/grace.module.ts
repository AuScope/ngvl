import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GraceAttributionComponent } from './grace-attribution.component';
import { GraceService } from './grace.service';
import { GraceStyleComponent } from './grace-style.component';
import { GraceStyleService } from './grace-style.service';
import { GraceGraphModalComponent } from './grace-graph.modal.component';
import { GraceGraphModalComponent2 } from './grace-graph.modal.component2';
import { InsarGraphModalComponent } from './insar-graph.modal.component';
import { OlMapGraceDataComponent } from './olmap.grace-data.component';
import { StyleChooserModalComponent } from './style-chooser.modal.component';
import { CreateAnimationModalComponent } from './create-animation.modal.component';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'primeng/colorpicker';
import { PlotlyViaCDNModule } from 'angular-plotly.js';
import { GraceStyleLegendComponent } from './grace-style-legend.component';
import { GraceDateComponent } from './grace-date.component';


// Using CDN module to avoid bug https://github.com/plotly/angular-plotly.js/issues/75
PlotlyViaCDNModule.setPlotlyVersion("1.55.1");
PlotlyViaCDNModule.setPlotlyBundle("basic");


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    PlotlyViaCDNModule,
    ColorPickerModule
  ],
  declarations: [ GraceAttributionComponent, GraceDateComponent, GraceGraphModalComponent, GraceGraphModalComponent2, InsarGraphModalComponent,
                  StyleChooserModalComponent, GraceStyleComponent, GraceStyleLegendComponent, OlMapGraceDataComponent, CreateAnimationModalComponent ],
  entryComponents: [ GraceAttributionComponent, GraceDateComponent, GraceGraphModalComponent, GraceGraphModalComponent2, InsarGraphModalComponent,
                     StyleChooserModalComponent, GraceStyleComponent, GraceStyleLegendComponent, OlMapGraceDataComponent, CreateAnimationModalComponent ],
  providers: [ GraceService, GraceStyleService ]
})
export class GraceModule { }

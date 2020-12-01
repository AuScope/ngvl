import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GraceService } from './grace.service';
import { GraceStyleService } from './grace-style.service';
import { GraceGraphModalComponent } from './grace-graph.modal.component';
import { StyleChooserModalComponent } from './style-chooser.modal.component';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'primeng/colorpicker';
import { PlotlyViaCDNModule } from 'angular-plotly.js';


// Using CDN module to avoid bug https://github.com/plotly/angular-plotly.js/issues/75
PlotlyViaCDNModule.setPlotlyVersion("1.55.1");
PlotlyViaCDNModule.setPlotlyBundle("basic");


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    PlotlyViaCDNModule,
    ColorPickerModule
  ],
  declarations: [ GraceGraphModalComponent, StyleChooserModalComponent ],
  entryComponents: [ GraceGraphModalComponent, StyleChooserModalComponent ],
  providers: [ GraceService, GraceStyleService ]
})
export class GraceModule { }

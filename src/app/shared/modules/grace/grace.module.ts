import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BasinChooserModalComponent } from './basin-chooser.modal.component';
import { GraceService } from './grace.service';
import { GraceStyleComponent } from './grace-style.component';
import { GraceStyleService } from './grace-style.service';
import { GraceGraphModalComponent } from './grace-graph.modal.component';
import { GraceGraphModalComponent2 } from './grace-graph.modal.component2';
import { OlMapGraceDataComponent } from './olmap.grace-data.component';
import { StyleChooserModalComponent } from './style-chooser.modal.component';
import { CreateAnimationModalComponent } from './create-animation.modal.component';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
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
    NgbTypeaheadModule,
    PlotlyViaCDNModule,
    ColorPickerModule
  ],
  declarations: [ BasinChooserModalComponent, GraceGraphModalComponent, GraceGraphModalComponent2, StyleChooserModalComponent, GraceStyleComponent, OlMapGraceDataComponent, CreateAnimationModalComponent ],
  entryComponents: [ BasinChooserModalComponent, GraceGraphModalComponent, GraceGraphModalComponent2, StyleChooserModalComponent, GraceStyleComponent, OlMapGraceDataComponent, CreateAnimationModalComponent ],
  providers: [ GraceService, GraceStyleService ]
})
export class GraceModule { }

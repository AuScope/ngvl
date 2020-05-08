import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraceService } from './grace.service';
import { GraceGraphModalComponent } from './grace-graph.modal.component';

import { PlotlyViaCDNModule } from 'angular-plotly.js';

// Using CDN module to avoid bug https://github.com/plotly/angular-plotly.js/issues/75
PlotlyViaCDNModule.plotlyVersion = '1.53.0';
PlotlyViaCDNModule.plotlyBundle = 'basic';


@NgModule({
  imports: [
    CommonModule,
    PlotlyViaCDNModule
  ],
  declarations: [ GraceGraphModalComponent ],
  entryComponents: [ GraceGraphModalComponent ],
  providers: [ GraceService ]
})
export class GraceModule { }

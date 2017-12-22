import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';

@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule
  ],
  declarations: [DatasetsComponent]
})
export class DatasetsModule { }

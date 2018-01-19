import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    NgbModule.forRoot()
  ],
  declarations: [DatasetsComponent]
})

export class DatasetsModule {}

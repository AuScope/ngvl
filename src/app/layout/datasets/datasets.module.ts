import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DatasetsMapComponent } from './datasets-map/datasets-map.component';
import { DatasetsMenuComponent } from './datasets-menu/datasets-menu.component';


@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    NgbModule.forRoot()
  ],
  declarations: [DatasetsComponent, DatasetsMapComponent, DatasetsMenuComponent]
})

export class DatasetsModule {}

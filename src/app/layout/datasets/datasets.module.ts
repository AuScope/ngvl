import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { DatasetsRoutingModule } from './datasets-routing.module';
import { DatasetsComponent } from './datasets.component';
import { PageHeaderModule } from '../../shared';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VGLService } from './services/vgl.service';


@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    DatasetsRoutingModule,
    NgbModule.forRoot(),
    HttpClientModule
  ],
  declarations: [DatasetsComponent],
  providers: [VGLService]
})

export class DatasetsModule {}

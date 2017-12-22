import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { PageHeaderModule } from '../../shared';

@NgModule({
  imports: [
    CommonModule,
    JobsRoutingModule,
    PageHeaderModule
  ],
  declarations: [JobsComponent]
})
export class JobsModule { }

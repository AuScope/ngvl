import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { PageHeaderModule } from '../../shared';
import { JobsService } from './jobs.service';
import { NgbPanel, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    JobsRoutingModule,
    PageHeaderModule,
    TreeTableModule,
    NgbModule.forRoot()
  ],
  declarations: [ JobsComponent ],
  providers: [ JobsService ]
})
export class JobsModule { }

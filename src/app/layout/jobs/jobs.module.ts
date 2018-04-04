import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { PageHeaderModule } from '../../shared';
import { JobsService } from './jobs.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    JobsRoutingModule,
    PageHeaderModule,
    TreeTableModule,
    NgbDropdownModule.forRoot()
  ],
  declarations: [ JobsComponent ],
  providers: [ JobsService ]
})
export class JobsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SolutionsRoutingModule } from './solutions-routing.module';
import { SolutionsComponent } from './solutions.component';
import { SolutionsService } from './solutions.service';
import {
  PageHeaderModule,
  SolutionsModule as SharedSolutionsModule
} from '../../shared';

import { SolutionsBrowserComponent } from './solutions-browser/solutions-browser.component';
import { SolutionsDetailComponent } from './solutions-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderModule,
    SharedSolutionsModule,
    SolutionsRoutingModule,
    NgbModule.forRoot()
  ],
  declarations: [
    SolutionsComponent,
    SolutionsBrowserComponent,
    SolutionsDetailComponent
  ],
  providers: [SolutionsService],
  exports: [SolutionsBrowserComponent]
})
export class SolutionsModule { }

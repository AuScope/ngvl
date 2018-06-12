import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SolutionsRoutingModule } from './solutions-routing.module';
import { SolutionsComponent } from './solutions.component';
import { SolutionsService } from './solutions.service';
import { PageHeaderModule } from '../../shared';
import { SolutionsBrowserComponent } from './solutions-browser/solutions-browser.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderModule,
    SolutionsRoutingModule,
    NgbModule.forRoot()
  ],
  declarations: [SolutionsComponent, SolutionsBrowserComponent],
  providers: [SolutionsService],
  exports: [SolutionsBrowserComponent]
})
export class SolutionsModule { }

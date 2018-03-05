import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolutionsRoutingModule } from './solutions-routing.module';
import { SolutionsComponent } from './solutions.component';
import { SolutionsService } from './solutions.service';
import { PageHeaderModule } from '../../shared';
import { SolutionsBrowserComponent } from './solutions-browser/solutions-browser.component';

@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    SolutionsRoutingModule
  ],
  declarations: [SolutionsComponent, SolutionsBrowserComponent],
  providers: [SolutionsService],
  exports: [SolutionsBrowserComponent]
})
export class SolutionsModule { }

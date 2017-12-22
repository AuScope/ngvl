import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolutionsRoutingModule } from './solutions-routing.module';
import { SolutionsComponent } from './solutions.component';
import { PageHeaderModule } from '../../shared';

@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    SolutionsRoutingModule
  ],
  declarations: [SolutionsComponent]
})
export class SolutionsModule { }

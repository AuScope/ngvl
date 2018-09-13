import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolutionsCartComponent } from './solutions-cart.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SolutionsCartComponent],
  exports: [SolutionsCartComponent]
})
export class SolutionsModule { }

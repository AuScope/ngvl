import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AccessDeniedRoutingModule } from './access-denied-routing.module';
import { AccessDeniedComponent } from './access-denied.component';

@NgModule({
  imports: [
    CommonModule,
    AccessDeniedRoutingModule,
    TranslateModule
  ],
  declarations: [AccessDeniedComponent]
})
export class AccessDeniedModule { }

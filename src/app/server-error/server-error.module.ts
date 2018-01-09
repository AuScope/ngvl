import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ServerErrorRoutingModule } from './server-error-routing.module';
import { ServerErrorComponent } from './server-error.component';

@NgModule({
  imports: [
    CommonModule,
    ServerErrorRoutingModule,
    TranslateModule
  ],
  declarations: [ServerErrorComponent]
})
export class ServerErrorModule { }

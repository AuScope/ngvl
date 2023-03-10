import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help-routing.module';


@NgModule({
    imports: [CommonModule, TranslateModule, HelpRoutingModule],
    declarations: [ HelpComponent ]
})
export class HelpModule {}

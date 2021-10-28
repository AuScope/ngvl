import { NgModule } from '@angular/core';
import { GraceModule } from '../grace/grace.module';
import { KeywordComponentsService } from './keyword-components.service';
import { LayerButtonDirective } from './layer-button.directive';
import { MapWidgetDirective } from './map-widget.directive';

@NgModule({
  imports: [
    GraceModule
  ],
  providers: [
    KeywordComponentsService
  ],
  declarations: [
    LayerButtonDirective,
    MapWidgetDirective
  ]
})
export class KeywordComponentsModule { }

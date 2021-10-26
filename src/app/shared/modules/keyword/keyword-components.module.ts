import { NgModule } from '@angular/core';
import { GraceModule } from '../grace/grace.module';
import { KeywordComponentsService } from './keyword-components.service';
import { LayerButtonDirective } from './layer-button.directive';
import { MapWidgetDirective } from './map-widget.directive';
import { TestModule } from './test/test.module';

@NgModule({
  imports: [
    GraceModule,

    TestModule
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
